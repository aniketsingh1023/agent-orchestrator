import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";

// GET /api/canvas/workflows/[id] — Load canvas workflow
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
          dependsOn: true,
          dependedBy: true,
        },
      },
    },
  });

  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Convert to canvas format
  const canvasNodes = workflow.steps.map((step) => ({
    id: step.id,
    type: step.agentType,
    label: step.name,
    config: step.agentType === "claude-task"
      ? { prompt: step.prompt, model: "claude-code", maxTokens: 4096, useContext: true }
      : (() => { try { return JSON.parse(step.prompt); } catch { return {}; } })(),
    positionX: step.positionX,
    positionY: step.positionY,
  }));

  const canvasEdges = workflow.steps.flatMap((step) =>
    step.dependsOn.map((dep) => ({
      id: dep.id,
      source: dep.dependencyStepId,
      target: dep.dependentStepId,
    }))
  );

  return NextResponse.json({
    id: workflow.id,
    name: workflow.name,
    status: workflow.status,
    canvasNodes,
    canvasEdges,
  });
}

const nodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  config: z.record(z.string(), z.unknown()),
  position: z.object({ x: z.number(), y: z.number() }),
});

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(200),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

// PUT /api/canvas/workflows/[id] — Update canvas workflow
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const workflow = await db.workflow.findFirst({ where: { id, userId } });
  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const { name, nodes, edges } = parsed.data;

  // Update workflow name
  await db.workflow.update({
    where: { id },
    data: { name },
  });

  // Delete existing steps and dependencies (cascade will handle deps)
  await db.workflowStep.deleteMany({ where: { workflowId: id } });

  // Re-create steps
  for (const node of nodes) {
    await db.workflowStep.create({
      data: {
        id: node.id,
        workflowId: id,
        name: node.label,
        prompt: node.type === "claude-task" ? String(node.config.prompt || "") : JSON.stringify(node.config),
        agentType: node.type,
        positionX: Math.round(node.position.x),
        positionY: Math.round(node.position.y),
      },
    });
  }

  // Re-create edges
  for (const edge of edges) {
    await db.workflowStepDependency.create({
      data: {
        id: edge.id,
        dependentStepId: edge.target,
        dependencyStepId: edge.source,
      },
    });
  }

  return NextResponse.json({ id, name });
}
