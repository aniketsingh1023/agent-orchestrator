import "dotenv/config";
import { Worker, Job } from "bullmq";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ClaudeCodeProvider } from "../lib/agents/claude-code";
import type { AgentProvider } from "../lib/agents/provider";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
};

const agents: Record<string, AgentProvider> = {
  "claude-code": new ClaudeCodeProvider(),
};

// ── Task Worker (Phase 1 — standalone tasks) ────────

interface TaskJobData {
  taskId: string;
  prompt: string;
  agentType: string;
}

async function processTask(job: Job<TaskJobData>) {
  const { taskId, prompt, agentType } = job.data;

  const agent = agents[agentType];
  if (!agent) {
    await db.task.update({
      where: { id: taskId },
      data: { status: "FAILED", errorMessage: `Unknown agent type: ${agentType}` },
    });
    return;
  }

  await db.task.update({
    where: { id: taskId },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  const onLog = async (stream: "stdout" | "stderr" | "system", content: string) => {
    const streamMap = { stdout: "STDOUT", stderr: "STDERR", system: "SYSTEM" } as const;
    await db.taskLog.create({
      data: { taskId, stream: streamMap[stream], content },
    });
  };

  const result = await agent.execute(prompt, onLog);

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

// ── Step Worker (Phase 2 — workflow steps with retry) ────────

interface StepJobData {
  stepExecutionId: string;
  executionId: string;
  prompt: string;
  agentType: string;
}

async function processStep(job: Job<StepJobData>) {
  const { stepExecutionId, executionId, prompt, agentType } = job.data;

  const agent = agents[agentType];
  if (!agent) {
    await db.stepExecution.update({
      where: { id: stepExecutionId },
      data: { status: "FAILED", errorMessage: `Unknown agent type: ${agentType}`, completedAt: new Date() },
    });
    await checkAndAdvance(executionId);
    return;
  }

  const stepExec = await db.stepExecution.findUnique({ where: { id: stepExecutionId } });
  if (!stepExec) return;

  // Mark running
  await db.stepExecution.update({
    where: { id: stepExecutionId },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
      attempt: stepExec.attempt + 1,
    },
  });

  const onLog = async (stream: "stdout" | "stderr" | "system", content: string) => {
    const streamMap = { stdout: "STDOUT", stderr: "STDERR", system: "SYSTEM" } as const;
    await db.stepLog.create({
      data: { stepExecutionId, stream: streamMap[stream], content },
    });
  };

  const result = await agent.execute(prompt, onLog);

  if (result.success) {
    await db.stepExecution.update({
      where: { id: stepExecutionId },
      data: { status: "COMPLETED", result: result.output || null, completedAt: new Date() },
    });
    await checkAndAdvance(executionId);
  } else {
    // Retry logic
    const currentAttempt = stepExec.attempt + 1;
    if (currentAttempt < stepExec.maxRetries) {
      const delay = stepExec.retryDelayMs * Math.pow(2, currentAttempt - 1); // exponential backoff
      await onLog("system", `Step failed (attempt ${currentAttempt}/${stepExec.maxRetries}). Retrying in ${delay}ms...`);

      await db.stepExecution.update({
        where: { id: stepExecutionId },
        data: { status: "PENDING", errorMessage: result.error || null },
      });

      // Re-enqueue with delay
      const { Queue } = await import("bullmq");
      const retryQueue = new Queue("task-execution", { connection: redisConnection });
      await retryQueue.add("execute-step", job.data, { delay });
      await retryQueue.close();
    } else {
      await onLog("system", `Step failed after ${currentAttempt} attempts. Giving up.`);
      await db.stepExecution.update({
        where: { id: stepExecutionId },
        data: { status: "FAILED", errorMessage: result.error || null, completedAt: new Date() },
      });
      await checkAndAdvance(executionId);
    }
  }
}

/**
 * After a step completes/fails, check if there are new steps ready to run
 * or if the entire execution is done.
 */
async function checkAndAdvance(executionId: string) {
  const stepExecutions = await db.stepExecution.findMany({
    where: { executionId },
    include: {
      step: {
        include: { dependsOn: true },
      },
    },
  });

  const allDone = stepExecutions.every(
    (se) => se.status === "COMPLETED" || se.status === "FAILED"
  );

  if (allDone) {
    const anyFailed = stepExecutions.some((se) => se.status === "FAILED");
    await db.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: anyFailed ? "FAILED" : "COMPLETED",
        completedAt: new Date(),
      },
    });
    console.log(`[worker] Workflow execution ${executionId} ${anyFailed ? "FAILED" : "COMPLETED"}`);
    return;
  }

  // Find pending steps whose dependencies are all completed
  for (const stepExec of stepExecutions) {
    if (stepExec.status !== "PENDING") continue;

    const depIds = stepExec.step.dependsOn.map((d) => d.dependencyStepId);

    if (depIds.length === 0) continue; // Already enqueued at start

    const depExecs = stepExecutions.filter((se) => depIds.includes(se.stepId));
    const allDepsCompleted = depExecs.every((de) => de.status === "COMPLETED");
    const anyDepFailed = depExecs.some((de) => de.status === "FAILED");

    if (allDepsCompleted) {
      // Enqueue this step
      await worker.client.then((queue) => {
        // Can't easily access queue from worker, so use a workaround
      });
      // Direct enqueue via new Queue reference
      const { Queue } = await import("bullmq");
      const q = new Queue("task-execution", { connection: redisConnection });
      await q.add("execute-step", {
        stepExecutionId: stepExec.id,
        executionId,
        prompt: stepExec.step.prompt,
        agentType: stepExec.step.agentType,
      });
      await q.close();
    } else if (anyDepFailed) {
      await db.stepExecution.update({
        where: { id: stepExec.id },
        data: {
          status: "FAILED",
          errorMessage: "Dependency step failed",
          completedAt: new Date(),
        },
      });
    }
  }
}

// ── Worker Setup ────────

const worker = new Worker(
  "task-execution",
  async (job: Job) => {
    if (job.name === "execute-step") {
      await processStep(job as Job<StepJobData>);
    } else {
      await processTask(job as Job<TaskJobData>);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.name} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.name} failed:`, err.message);
});

console.log("[worker] Task execution worker started (Phase 1 + Phase 2)");
