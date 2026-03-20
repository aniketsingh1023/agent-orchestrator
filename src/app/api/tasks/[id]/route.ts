import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/tasks/[id] — Task detail with logs
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const task = await db.task.findFirst({
    where: { id, userId },
    include: {
      logs: {
        orderBy: { timestamp: "asc" },
      },
    },
  });

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  return NextResponse.json(task);
}

// PATCH /api/tasks/[id] — Cancel a task
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const task = await db.task.findFirst({
    where: { id, userId },
  });

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  if (task.status !== "QUEUED") {
    return NextResponse.json({ error: "Only queued tasks can be cancelled" }, { status: 400 });
  }

  const updated = await db.task.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json(updated);
}
