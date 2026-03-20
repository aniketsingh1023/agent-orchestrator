"use client";

import { useState } from "react";
import { type NodeType, NODE_DEFINITIONS } from "@/types/workflow";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useReactFlow } from "@xyflow/react";

export function NodeToolbar() {
  const [collapsed, setCollapsed] = useState(false);
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
    <div className={`absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200 shadow-lg transition-all duration-200 ${collapsed ? "w-12 p-1.5" : "w-52 p-2"}`}>
      {/* Header — always visible, click to toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`flex items-center gap-2 w-full rounded-xl hover:bg-neutral-50 transition-colors ${collapsed ? "justify-center p-2" : "px-3 py-2"}`}
      >
        <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-[9px]">C</span>
        </div>
        {!collapsed && (
          <>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex-1 text-left">Nodes</span>
            <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Node list — hidden when collapsed */}
      {!collapsed && (
        <>
          <div className="h-px bg-neutral-100 mx-2 my-1" />
          <div className="space-y-0.5">
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
        </>
      )}
    </div>
  );
}
