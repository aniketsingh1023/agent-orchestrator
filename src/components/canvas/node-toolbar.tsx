"use client";

import { type NodeType, NODE_DEFINITIONS } from "@/types/workflow";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useReactFlow } from "@xyflow/react";

export function NodeToolbar() {
  const addNode = useWorkflowStore((s) => s.addNode);
  const { screenToFlowPosition } = useReactFlow();

  const nodeTypes = Object.entries(NODE_DEFINITIONS) as [NodeType, (typeof NODE_DEFINITIONS)[NodeType]][];

  function handleDragStart(e: React.DragEvent, type: NodeType) {
    e.dataTransfer.setData("application/node-type", type);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleClick(type: NodeType) {
    // Add node to center of viewport
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addNode(type, position);
  }

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-xl border border-neutral-200 shadow-lg p-2 space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 px-2 py-1">
        Nodes
      </p>
      {nodeTypes.map(([type, def]) => (
        <button
          key={type}
          draggable
          onDragStart={(e) => handleDragStart(e, type)}
          onClick={() => handleClick(type)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 transition-colors cursor-grab active:cursor-grabbing"
          title={def.description}
        >
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
            style={{ backgroundColor: `${def.color}15`, color: def.color }}
          >
            {def.icon}
          </span>
          <span className="font-medium">{def.label}</span>
        </button>
      ))}
    </div>
  );
}
