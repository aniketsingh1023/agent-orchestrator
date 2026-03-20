import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";

const createStepSchema = z.object({
  name: z.string().min(1).max(200),
  prompt: z.string().min(1).max(10000),
  agentType: z.string().default("claude-code"),
  positionX: z.number().int().default(0),
  positionY: z.number().int().default(0),
  maxRetries: z.number().int().min(0).max(10).default(3),
  retryDelayMs: z.number().int().min(0).max(300000).default(5000),
  dependsOn: z.array(z.string().uuid()).default([]), // Step IDs this step depends on
});

// POST /api/workflows/[id]/steps — Add a step to a workflow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workflowId } = await params;

  const workflow = await db.workflow.findFirst({ where: { id: workflowId, userId } });
  if (!workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createStepSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const { dependsOn, ...stepData } = parsed.data;

  const step = await db.workflowStep.create({
    data: {
      ...stepData,
      workflowId,
      dependsOn: dependsOn.length > 0
        ? {
            create: dependsOn.map((depId) => ({
              dependencyStepId: depId,
            })),
          }
        : undefined,
    },
    include: {
      dependsOn: { select: { dependencyStepId: true } },
    },
  });

  return NextResponse.json(step, { status: 201 });
}
