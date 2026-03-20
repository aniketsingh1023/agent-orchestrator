import "dotenv/config";
import { Worker, Job, Queue } from "bullmq";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { claudeRuntime, type RuntimeEvent, type TaskContext } from "../lib/agents/claude-runtime";
import { WebSocketServer, WebSocket } from "ws";

// ── Database ────────────────────────────

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
};

const taskQueue = new Queue("task-execution", { connection: redisConnection });

// ── WebSocket Server for real-time updates ────────────────────────────

const wss = new WebSocketServer({ port: parseInt(process.env.WS_PORT || "3002") });
const clients = new Map<string, Set<WebSocket>>(); // executionId → connected clients

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "", `http://localhost`);
  const executionId = url.searchParams.get("executionId");
  if (!executionId) {
    ws.close();
    return;
  }

  if (!clients.has(executionId)) clients.set(executionId, new Set());
  clients.get(executionId)!.add(ws);

  ws.on("close", () => {
    clients.get(executionId)?.delete(ws);
    if (clients.get(executionId)?.size === 0) clients.delete(executionId);
  });
});

function broadcast(executionId: string, event: RuntimeEvent) {
  const sockets = clients.get(executionId);
  if (!sockets) return;
  const msg = JSON.stringify(event);
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

// ── Execution Logic ────────────────────────────

/**
 * Get outputs from all completed upstream nodes for context chaining.
 */
async function getUpstreamOutputs(
  executionId: string,
  stepId: string
): Promise<Map<string, string>> {
  const outputs = new Map<string, string>();

  // Find all dependencies of this step
  const deps = await db.workflowStepDependency.findMany({
    where: { dependentStepId: stepId },
  });

  for (const dep of deps) {
    const upstreamExec = await db.stepExecution.findFirst({
      where: {
        executionId,
        stepId: dep.dependencyStepId,
        status: "COMPLETED",
      },
    });

    if (upstreamExec?.result) {
      outputs.set(dep.dependencyStepId, upstreamExec.result);
    }
  }

  return outputs;
}

/**
 * After a node completes, find and enqueue the next ready nodes.
 */
async function advanceDAG(executionId: string) {
  const allStepExecs = await db.stepExecution.findMany({
    where: { executionId },
    include: {
      step: { include: { dependsOn: true } },
    },
  });

  // Check if workflow is done
  const allDone = allStepExecs.every(
    (se) => se.status === "COMPLETED" || se.status === "FAILED"
  );

  if (allDone) {
    const anyFailed = allStepExecs.some((se) => se.status === "FAILED");
    await db.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: anyFailed ? "FAILED" : "COMPLETED",
        completedAt: new Date(),
      },
    });

    broadcast(executionId, {
      type: anyFailed ? "task_failed" : "task_completed",
      nodeId: "__workflow__",
      executionId,
      timestamp: Date.now(),
      data: { status: anyFailed ? "FAILED" : "COMPLETED" },
    });

    console.log(`[worker] Execution ${executionId} ${anyFailed ? "FAILED" : "COMPLETED"}`);
    return;
  }

  // Find pending steps whose deps are all completed
  for (const stepExec of allStepExecs) {
    if (stepExec.status !== "PENDING") continue;

    const depIds = stepExec.step.dependsOn.map((d) => d.dependencyStepId);

    // Steps with no deps were already enqueued at start
    if (depIds.length === 0) continue;

    const depExecs = allStepExecs.filter((se) => depIds.includes(se.stepId));
    const allDepsCompleted = depExecs.every((de) => de.status === "COMPLETED");
    const anyDepFailed = depExecs.some((de) => de.status === "FAILED");

    if (allDepsCompleted) {
      await taskQueue.add("execute-step", {
        stepExecutionId: stepExec.id,
        executionId,
        stepId: stepExec.stepId,
      });
    } else if (anyDepFailed) {
      await db.stepExecution.update({
        where: { id: stepExec.id },
        data: {
          status: "FAILED",
          errorMessage: "Upstream node failed",
          completedAt: new Date(),
        },
      });

      broadcast(executionId, {
        type: "task_failed",
        nodeId: stepExec.stepId,
        executionId,
        timestamp: Date.now(),
        data: { error: "Upstream node failed" },
      });
    }
  }
}

// ── Job Handlers ────────────────────────────

interface StepJobData {
  stepExecutionId: string;
  executionId: string;
  stepId: string;
}

interface TaskJobData {
  taskId: string;
  prompt: string;
  agentType: string;
}

async function processStepJob(job: Job<StepJobData>) {
  const { stepExecutionId, executionId, stepId } = job.data;

  const stepExec = await db.stepExecution.findUnique({
    where: { id: stepExecutionId },
    include: { step: true },
  });

  if (!stepExec) return;

  const step = stepExec.step;
  const nodeType = step.agentType; // "start", "claude-task", "claude-review", "gate", "merge", "output"

  // ── Handle non-Claude node types ──

  if (nodeType === "start") {
    await db.stepExecution.update({
      where: { id: stepExecutionId },
      data: {
        status: "COMPLETED",
        result: "Workflow started",
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    broadcast(executionId, {
      type: "task_completed",
      nodeId: stepId,
      executionId,
      timestamp: Date.now(),
      data: { output: "Workflow started", durationMs: 0 },
    });

    await advanceDAG(executionId);
    return;
  }

  if (nodeType === "gate") {
    const upstreamOutputs = await getUpstreamOutputs(executionId, stepId);
    const input = Array.from(upstreamOutputs.values()).join("\n");
    let config: Record<string, unknown> = {};
    try { config = JSON.parse(step.prompt); } catch { /* */ }

    const condition = String(config.condition || "not_empty");
    const value = String(config.value || "");
    let pass = false;

    switch (condition) {
      case "contains": pass = input.includes(value); break;
      case "not_contains": pass = !input.includes(value); break;
      case "equals": pass = input.trim() === value.trim(); break;
      case "not_empty": pass = input.trim().length > 0; break;
      default: pass = input.trim().length > 0;
    }

    await db.stepExecution.update({
      where: { id: stepExecutionId },
      data: {
        status: "COMPLETED",
        result: pass ? "PASS" : "FAIL",
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    broadcast(executionId, {
      type: "task_completed",
      nodeId: stepId,
      executionId,
      timestamp: Date.now(),
      data: { output: pass ? "PASS" : "FAIL" },
    });

    await advanceDAG(executionId);
    return;
  }

  if (nodeType === "merge") {
    const upstreamOutputs = await getUpstreamOutputs(executionId, stepId);
    let config: Record<string, unknown> = {};
    try { config = JSON.parse(step.prompt); } catch { /* */ }

    const strategy = String(config.strategy || "concat");
    const separator = String(config.separator || "\n\n---\n\n");
    let merged: string;

    switch (strategy) {
      case "json_merge":
        merged = JSON.stringify(Object.fromEntries(upstreamOutputs));
        break;
      case "latest":
        merged = Array.from(upstreamOutputs.values()).pop() || "";
        break;
      default:
        merged = Array.from(upstreamOutputs.values()).join(separator);
    }

    await db.stepExecution.update({
      where: { id: stepExecutionId },
      data: {
        status: "COMPLETED",
        result: merged,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    broadcast(executionId, {
      type: "task_completed",
      nodeId: stepId,
      executionId,
      timestamp: Date.now(),
      data: { output: merged.slice(0, 1000) },
    });

    await advanceDAG(executionId);
    return;
  }

  if (nodeType === "output") {
    const upstreamOutputs = await getUpstreamOutputs(executionId, stepId);
    const finalOutput = Array.from(upstreamOutputs.values()).join("\n\n");

    await db.stepExecution.update({
      where: { id: stepExecutionId },
      data: {
        status: "COMPLETED",
        result: finalOutput,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    broadcast(executionId, {
      type: "task_completed",
      nodeId: stepId,
      executionId,
      timestamp: Date.now(),
      data: { output: finalOutput.slice(0, 2000) },
    });

    await advanceDAG(executionId);
    return;
  }

  // ── Claude Task / Claude Review — the core execution ──

  await db.stepExecution.update({
    where: { id: stepExecutionId },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  broadcast(executionId, {
    type: "task_started",
    nodeId: stepId,
    executionId,
    timestamp: Date.now(),
    data: {},
  });

  const upstreamOutputs = await getUpstreamOutputs(executionId, stepId);

  // Build prompt based on node type
  let prompt: string;
  if (nodeType === "claude-review") {
    let config: Record<string, unknown> = {};
    try { config = JSON.parse(step.prompt); } catch { /* */ }
    const reviewPrompt = String(config.reviewPrompt || "Review the following output.");
    prompt = reviewPrompt;
  } else {
    prompt = step.prompt;
  }

  const ctx: TaskContext = {
    nodeId: stepId,
    executionId,
    prompt,
    upstreamOutputs,
    maxRetries: stepExec.maxRetries,
    retryDelayMs: stepExec.retryDelayMs,
  };

  const onEvent = async (event: RuntimeEvent) => {
    // Persist logs
    if (event.type === "task_output") {
      const stream = String(event.data.stream || "stdout").toUpperCase();
      await db.stepLog.create({
        data: {
          stepExecutionId,
          stream: stream as "STDOUT" | "STDERR" | "SYSTEM",
          content: String(event.data.content),
        },
      });
    }

    // Broadcast to connected WebSocket clients
    broadcast(executionId, event);
  };

  const result = await claudeRuntime.executeWithRetry(ctx, onEvent);

  await db.stepExecution.update({
    where: { id: stepExecutionId },
    data: {
      status: result.success ? "COMPLETED" : "FAILED",
      result: result.output || null,
      errorMessage: result.error || null,
      completedAt: new Date(),
      attempt: stepExec.attempt + 1,
    },
  });

  await advanceDAG(executionId);
}

// Legacy standalone task handler (Phase 1 compatibility)
async function processTaskJob(job: Job<TaskJobData>) {
  const { taskId, prompt } = job.data;

  await db.task.update({
    where: { id: taskId },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  const ctx: TaskContext = {
    nodeId: taskId,
    executionId: taskId,
    prompt,
    upstreamOutputs: new Map(),
    maxRetries: 2,
    retryDelayMs: 5000,
  };

  const onEvent = async (event: RuntimeEvent) => {
    if (event.type === "task_output") {
      const stream = String(event.data.stream || "stdout").toUpperCase();
      await db.taskLog.create({
        data: {
          taskId,
          stream: stream as "STDOUT" | "STDERR" | "SYSTEM",
          content: String(event.data.content),
        },
      });
    }
  };

  const result = await claudeRuntime.executeWithRetry(ctx, onEvent);

  await db.task.update({
    where: { id: taskId },
    data: {
      status: result.success ? "COMPLETED" : "FAILED",
      result: result.output || null,
      errorMessage: result.error || null,
      completedAt: new Date(),
    },
  });
}

// ── Worker Setup ────────────────────────────

const worker = new Worker(
  "task-execution",
  async (job: Job) => {
    if (job.name === "execute-step") {
      await processStepJob(job as Job<StepJobData>);
    } else {
      await processTaskJob(job as Job<TaskJobData>);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.name} done`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.name} failed:`, err.message);
});

console.log("[CtrlAI Worker] Started — Claude Runtime Controller active");
console.log(`[CtrlAI Worker] WebSocket server on port ${process.env.WS_PORT || 3002}`);
