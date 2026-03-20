import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { startWorkflowExecution, getReadySteps } from "@/lib/workflow-engine";
import { taskQueue } from "@/lib/queue";

// POST /api/workflows/[id]/execute — Run a workflow
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workflowId } = await params;

  const workflow = await db.workflow.findFirst({
    where: { id: workflowId, userId },
    include: { steps: true },
  });

  if (!workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  if (workflow.steps.length === 0) {
    return NextResponse.json({ error: "Workflow has no steps" }, { status: 400 });
  }

  // Check plan limits for concurrency
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const runningExecutions = await db.workflowExecution.count({
    where: { workflow: { userId }, status: "RUNNING" },
  });

  const concurrencyLimits = { FREE: 1, PRO: 5, TEAM: 20 };
  const limit = concurrencyLimits[user.plan];

  if (runningExecutions >= limit) {
    return NextResponse.json(
      { error: `Concurrency limit reached (${limit}). Upgrade for more parallel executions.` },
      { status: 429 }
    );
  }

  // Start execution
  const execution = await startWorkflowExecution(workflowId);

  // Enqueue ready steps (those with no dependencies)
  const readySteps = await getReadySteps(execution.id);
  for (const stepExec of readySteps) {
    await taskQueue.add("execute-step", {
      stepExecutionId: stepExec.id,
      executionId: execution.id,
      prompt: stepExec.step.prompt,
      agentType: stepExec.step.agentType,
    });
  }

  return NextResponse.json(execution, { status: 201 });
}
