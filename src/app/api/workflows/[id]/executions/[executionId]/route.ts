import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/workflows/[id]/executions/[executionId] — Execution detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; executionId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workflowId, executionId } = await params;

  const workflow = await db.workflow.findFirst({ where: { id: workflowId, userId } });
  if (!workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });

  const execution = await db.workflowExecution.findFirst({
    where: { id: executionId, workflowId },
    include: {
      stepExecutions: {
        include: {
          step: true,
          logs: { orderBy: { timestamp: "asc" } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!execution) return NextResponse.json({ error: "Execution not found" }, { status: 404 });

  return NextResponse.json(execution);
}
