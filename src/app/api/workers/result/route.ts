import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";

const resultSchema = z.object({
  stepExecutionId: z.string().uuid(),
  status: z.enum(["completed", "failed"]),
  output: z.string().optional(),
  error: z.string().optional(),
  logs: z.array(z.object({
    stream: z.enum(["stdout", "stderr", "system"]),
    content: z.string(),
    timestamp: z.string().optional(),
  })).optional(),
  durationMs: z.number().optional(),
});

/**
 * POST /api/workers/result — CLI worker submits task result
 *
 * After executing Claude Code, the CLI sends:
 * - status (completed/failed)
 * - output (Claude's response)
 * - logs (stdout/stderr lines)
 * - durationMs
 *
 * Backend then:
 * 1. Updates step execution status + result
 * 2. Persists logs
 * 3. Advances the DAG (finds next ready nodes, marks them PENDING)
 * 4. If all nodes done, marks workflow execution as COMPLETED/FAILED
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 401 });

  const worker = await db.worker.findUnique({ where: { apiKey } });
  if (!worker) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  const body = await req.json();
  const parsed = resultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const { stepExecutionId, status, output, error, logs, durationMs } = parsed.data;

  // Verify this step execution belongs to this user
  const stepExec = await db.stepExecution.findFirst({
    where: {
      id: stepExecutionId,
      execution: { workflow: { userId: worker.userId } },
    },
    include: { execution: true },
  });

  if (!stepExec) {
    return NextResponse.json({ error: "Step execution not found" }, { status: 404 });
  }

  // Update step execution
  const dbStatus = status === "completed" ? "COMPLETED" : "FAILED";
  await db.stepExecution.update({
    where: { id: stepExecutionId },
    data: {
      status: dbStatus,
      result: output || null,
      errorMessage: error || null,
      completedAt: new Date(),
    },
  });

  // Persist logs
  if (logs && logs.length > 0) {
    await db.stepLog.createMany({
      data: logs.map((log) => ({
        stepExecutionId,
        stream: log.stream.toUpperCase() as "STDOUT" | "STDERR" | "SYSTEM",
        content: log.content,
        timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
      })),
    });
  }

  // ── Advance the DAG ──

  const executionId = stepExec.executionId;
  const allStepExecs = await db.stepExecution.findMany({
    where: { executionId },
    include: {
      step: { include: { dependsOn: true } },
    },
  });

  // Check if workflow is complete
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

    return NextResponse.json({
      accepted: true,
      workflowStatus: anyFailed ? "FAILED" : "COMPLETED",
      nextTask: null,
    });
  }

  // Find nodes that are now ready (all deps completed)
  let advancedCount = 0;
  for (const se of allStepExecs) {
    if (se.status !== "PENDING") continue;

    const depIds = se.step.dependsOn.map((d) => d.dependencyStepId);
    if (depIds.length === 0) continue; // Root nodes already handled

    const depExecs = allStepExecs.filter((x) => depIds.includes(x.stepId));
    const allDepsCompleted = depExecs.every((d) => d.status === "COMPLETED");
    const anyDepFailed = depExecs.some((d) => d.status === "FAILED");

    if (anyDepFailed) {
      // Cascade failure
      await db.stepExecution.update({
        where: { id: se.id },
        data: {
          status: "FAILED",
          errorMessage: "Upstream node failed",
          completedAt: new Date(),
        },
      });
    } else if (allDepsCompleted) {
      // This node is ready — leave it PENDING so poll picks it up
      advancedCount++;
    }
  }

  return NextResponse.json({
    accepted: true,
    workflowStatus: "RUNNING",
    nodesReady: advancedCount,
  });
}
