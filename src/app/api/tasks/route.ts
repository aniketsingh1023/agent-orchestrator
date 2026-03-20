import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { taskQueue } from "@/lib/queue";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const createTaskSchema = z.object({
  name: z.string().min(1).max(200),
  prompt: z.string().min(1).max(10000),
  agentType: z.string().default("claude-code"),
});

// POST /api/tasks — Create a new task
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit
  if (!rateLimit(userId).success) return rateLimitResponse();

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Quota check
  const now = new Date();
  if (user.quotaResetAt < now) {
    // Reset monthly quota
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await db.user.update({
      where: { id: userId },
      data: { tasksUsedThisMonth: 0, quotaResetAt: nextReset },
    });
    user.tasksUsedThisMonth = 0;
  }

  if (user.tasksUsedThisMonth >= user.taskQuota) {
    return NextResponse.json(
      { error: "Monthly task quota exceeded. Upgrade your plan for more tasks." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const { name, prompt, agentType } = parsed.data;

  const task = await db.task.create({
    data: { name, prompt, agentType, userId },
  });

  // Increment usage
  await db.user.update({
    where: { id: userId },
    data: { tasksUsedThisMonth: { increment: 1 } },
  });

  // Enqueue job
  await taskQueue.add("execute", {
    taskId: task.id,
    prompt: task.prompt,
    agentType: task.agentType,
  });

  return NextResponse.json(task, { status: 201 });
}

// GET /api/tasks — List tasks for current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await db.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      status: true,
      agentType: true,
      createdAt: true,
      startedAt: true,
      completedAt: true,
    },
  });

  return NextResponse.json(tasks);
}
