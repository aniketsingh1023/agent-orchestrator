import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { startWorkflowExecution, getReadySteps } from "@/lib/workflow-engine";
import { taskQueue } from "@/lib/queue";

// POST /api/canvas/workflows/[id]/execute — Execute canvas workflow
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

  const execution = await startWorkflowExecution(id);

  const readySteps = await getReadySteps(execution.id);
  for (const stepExec of readySteps) {
    await taskQueue.add("execute-step", {
      stepExecutionId: stepExec.id,
      executionId: execution.id,
      prompt: stepExec.step.prompt,
      agentType: stepExec.step.agentType,
    });
  }

  return NextResponse.json({ executionId: execution.id }, { status: 201 });
}
