"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { WorkflowCanvas } from "@/components/canvas/workflow-canvas";
import { useWorkflowStore } from "@/stores/workflow-store";
import type { NodeData, NodeType } from "@/types/workflow";
import type { Node, Edge, MarkerType } from "@xyflow/react";

interface ServerNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, unknown>;
  positionX: number;
  positionY: number;
}

interface ServerEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface ServerWorkflow {
  id: string;
  name: string;
  canvasNodes: ServerNode[];
  canvasEdges: ServerEdge[];
}

export default function CanvasEditPage() {
  const params = useParams();
  const setWorkflow = useWorkflowStore((s) => s.setWorkflow);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/canvas/workflows/${params.id}`);
      if (!res.ok) return;
      const data: ServerWorkflow = await res.json();

      const nodes = data.canvasNodes.map((n) => ({
        id: n.id,
        type: "custom" as const,
        position: { x: n.positionX, y: n.positionY },
        data: {
          label: n.label,
          type: n.type as NodeType,
          config: n.config as NodeData["config"],
          executionState: "idle" as const,
        } satisfies NodeData,
      }));

      const edges: Edge[] = data.canvasEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || undefined,
        targetHandle: e.targetHandle || undefined,
        type: "smoothstep",
        style: { strokeWidth: 2, stroke: "#94a3b8" },
        markerEnd: { type: "arrowclosed" as MarkerType, width: 16, height: 16 },
      }));

      setWorkflow(data.id, data.name, nodes, edges);
    }

    load();
  }, [params.id, setWorkflow]);

  return (
    <div className="w-full h-screen">
      <WorkflowCanvas />
    </div>
  );
}
