import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/workers/poll — CLI worker polls for tasks
 *
 * Auth: API key in Authorization header
 * Returns: next pending step execution assigned to this user, or null
 *
 * Flow:
 * 1. CLI sends: GET /api/workers/poll (with api key)
 * 2. Backend finds oldest PENDING step execution for this user's workflows
 * 3. Atomically marks it RUNNING (prevents double-pickup)
 * 4. Returns task details + upstream context
 * 5. CLI executes Claude Code
 * 6. CLI sends result back via POST /api/workers/result
 */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 401 });

  const worker = await db.worker.findUnique({ where: { apiKey } });
  if (!worker) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  // Update worker status + ping
  await db.worker.update({
    where: { id: worker.id },
    data: { status: "ONLINE", lastPingAt: new Date() },
  });

  // Find the next pending step execution for this user's workflows
  const stepExec = await db.stepExecution.findFirst({
    where: {
      status: "PENDING",
      execution: {
        status: "RUNNING",
        workflow: { userId: worker.userId },
      },
    },
    include: {
      step: {
        include: {
          dependsOn: true,
        },
      },
      execution: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!stepExec) {
    return NextResponse.json({ task: null });
  }

  // Check all dependencies are completed before assigning
  if (stepExec.step.dependsOn.length > 0) {
    const depStepIds = stepExec.step.dependsOn.map((d) => d.dependencyStepId);
    const depExecs = await db.stepExecution.findMany({
      where: {
        executionId: stepExec.executionId,
        stepId: { in: depStepIds },
      },
    });

    const allDepsCompleted = depExecs.every((d) => d.status === "COMPLETED");
    if (!allDepsCompleted) {
      return NextResponse.json({ task: null });
    }
  }

  // Atomically claim this task (set to RUNNING)
  await db.stepExecution.update({
    where: { id: stepExec.id },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
      attempt: { increment: 1 },
    },
  });

  // Gather upstream outputs for context chaining
  const upstreamOutputs: Record<string, string> = {};
  if (stepExec.step.dependsOn.length > 0) {
    const depStepIds = stepExec.step.dependsOn.map((d) => d.dependencyStepId);
    const completedDeps = await db.stepExecution.findMany({
      where: {
        executionId: stepExec.executionId,
        stepId: { in: depStepIds },
        status: "COMPLETED",
      },
      include: { step: { select: { name: true } } },
    });

    for (const dep of completedDeps) {
      if (dep.result) {
        upstreamOutputs[dep.step.name] = dep.result;
      }
    }
  }

  return NextResponse.json({
    task: {
      stepExecutionId: stepExec.id,
      executionId: stepExec.executionId,
      nodeType: stepExec.step.agentType,
      name: stepExec.step.name,
      prompt: stepExec.step.prompt,
      upstreamOutputs,
      maxRetries: stepExec.maxRetries,
      retryDelayMs: stepExec.retryDelayMs,
      attempt: stepExec.attempt + 1,
    },
  });
}
