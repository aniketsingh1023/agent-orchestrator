import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * GET /api/canvas/workflows/[id]/executions/[executionId]
 *
 * Returns execution status + all step execution states.
 * The canvas polls this to update node states in real-time.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; executionId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workflowId, executionId } = await params;

  const workflow = await db.workflow.findFirst({ where: { id: workflowId, userId } });
  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const execution = await db.workflowExecution.findFirst({
    where: { id: executionId, workflowId },
    include: {
      stepExecutions: {
        include: {
          step: { select: { id: true, name: true, agentType: true } },
        },
      },
    },
  });

  if (!execution) return NextResponse.json({ error: "Execution not found" }, { status: 404 });

  // Map to canvas-friendly format: stepId → state
  const nodeStates: Record<string, {
    status: string;
    output?: string;
    error?: string;
    durationMs?: number;
  }> = {};

  for (const se of execution.stepExecutions) {
    const durationMs = se.startedAt && se.completedAt
      ? se.completedAt.getTime() - se.startedAt.getTime()
      : undefined;

    nodeStates[se.step.id] = {
      status: se.status,
      output: se.result?.slice(0, 500) || undefined,
      error: se.errorMessage || undefined,
      durationMs,
    };
  }

  return NextResponse.json({
    executionId: execution.id,
    status: execution.status,
    nodeStates,
  });
}
