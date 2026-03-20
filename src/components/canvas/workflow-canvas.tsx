"use client";

import { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkflowStore } from "@/stores/workflow-store";
import { type NodeType, type NodeData } from "@/types/workflow";
import { CustomNode } from "./nodes/custom-node";
import { NodeToolbar } from "./node-toolbar";
import { ConfigPanel } from "./config-panel";
import { CanvasHeader } from "./canvas-header";
import type { Node } from "@xyflow/react";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

function CanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const addNode = useWorkflowStore((s) => s.addNode);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/node-type") as NodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="relative w-full h-full" ref={reactFlowWrapper}>
      <CanvasHeader />
      <NodeToolbar />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { strokeWidth: 2, stroke: "#94a3b8" },
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-neutral-50"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#d4d4d8" />
        <Controls
          className="!bg-white !border !border-neutral-200 !rounded-xl !shadow-sm"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-white !border !border-neutral-200 !rounded-xl !shadow-sm"
          nodeColor={(node: Node<NodeData>) => {
            const state = node.data?.executionState;
            if (state === "running") return "#f97316";
            if (state === "success") return "#22c55e";
            if (state === "error") return "#ef4444";
            return "#d4d4d8";
          }}
          maskColor="rgba(0, 0, 0, 0.05)"
          pannable
          zoomable
        />
      </ReactFlow>

      {selectedNodeId && <ConfigPanel />}
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
