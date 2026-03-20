import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/workflows/[id] — Workflow detail with steps and dependencies
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const workflow = await db.workflow.findFirst({
    where: { id, userId },
    include: {
      steps: {
        include: {
          dependsOn: { select: { dependencyStepId: true } },
          dependedBy: { select: { dependentStepId: true } },
        },
      },
      executions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          _count: { select: { stepExecutions: true } },
        },
      },
    },
  });

  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(workflow);
}

// DELETE /api/workflows/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const workflow = await db.workflow.findFirst({ where: { id, userId } });
  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.workflow.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
