import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { startWorkflowExecution } from "@/lib/workflow-engine";

/**
 * POST /api/canvas/workflows/[id]/execute
 *
 * Starts a workflow execution:
 * 1. Creates WorkflowExecution (status: RUNNING)
 * 2. Creates StepExecution for each step (status: PENDING)
 * 3. CLI workers poll /api/workers/poll and pick up PENDING steps
 * 4. DAG advancement happens in /api/workers/result when steps complete
 *
 * No BullMQ needed — the CLI worker IS the execution engine.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const workflow = await db.workflow.findFirst({
    where: { id, userId },
    include: { steps: true },
  });

  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (workflow.steps.length === 0) {
    return NextResponse.json({ error: "Workflow has no nodes" }, { status: 400 });
  }

  // Check if user has a connected worker
  const workerCount = await db.worker.count({
    where: { userId, status: "ONLINE" },
  });

  const execution = await startWorkflowExecution(id);

  return NextResponse.json({
    executionId: execution.id,
    stepCount: workflow.steps.length,
    workerOnline: workerCount > 0,
    message: workerCount > 0
      ? "Execution started. Your CLI worker will pick up tasks."
      : "Execution started. Connect a worker with 'ctrlai connect' to execute tasks.",
  }, { status: 201 });
}
