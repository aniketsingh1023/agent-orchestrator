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
    const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    addNode(type, position);
  }

  return (
    <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200 shadow-lg p-2 space-y-0.5 w-52">
      <div className="px-3 py-2 flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
          <span className="text-white font-bold text-[8px]">C</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">CtrlAI Nodes</span>
      </div>

      <div className="h-px bg-neutral-100 mx-2" />

      {nodeTypes.map(([type, def]) => (
        <button
          key={type}
          draggable
          onDragStart={(e) => handleDragStart(e, type)}
          onClick={() => handleClick(type)}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50 transition-colors cursor-grab active:cursor-grabbing"
          title={def.description}
        >
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
            style={{ backgroundColor: `${def.color}12`, color: def.color }}
          >
            {def.icon}
          </span>
          <div className="text-left">
            <span className="font-medium text-xs block">{def.label}</span>
            <span className="text-[10px] text-neutral-400 block leading-tight">{def.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
