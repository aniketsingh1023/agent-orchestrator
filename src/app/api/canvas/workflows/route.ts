import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";

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

const createCanvasWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

// POST /api/canvas/workflows — Create new canvas workflow
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createCanvasWorkflowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const { name, nodes, edges } = parsed.data;

  // Create workflow with canvas data stored as JSON
  const workflow = await db.workflow.create({
    data: {
      name,
      userId,
      status: "DRAFT",
    },
  });

  // Store canvas nodes and edges
  // We'll use WorkflowStep for nodes and store canvas metadata
  for (const node of nodes) {
    await db.workflowStep.create({
      data: {
        id: node.id,
        workflowId: workflow.id,
        name: node.label,
        prompt: node.type === "claude-task" ? String(node.config.prompt || "") : JSON.stringify(node.config),
        agentType: node.type,
        positionX: Math.round(node.position.x),
        positionY: Math.round(node.position.y),
      },
    });
  }

  // Store edges as dependencies
  for (const edge of edges) {
    await db.workflowStepDependency.create({
      data: {
        id: edge.id,
        dependentStepId: edge.target,
        dependencyStepId: edge.source,
      },
    });
  }

  return NextResponse.json({
    id: workflow.id,
    name: workflow.name,
  }, { status: 201 });
}
