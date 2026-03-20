"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { type NodeData, NODE_DEFINITIONS } from "@/types/workflow";
import { useWorkflowStore } from "@/stores/workflow-store";

function CustomNodeComponent({ id, data, selected }: NodeProps<Node<NodeData>>) {
  const def = NODE_DEFINITIONS[data.type];
  const selectNode = useWorkflowStore((s) => s.selectNode);

  const stateStyles: Record<string, string> = {
    idle: "border-neutral-200",
    running: "border-orange-400 shadow-orange-100",
    success: "border-green-400 shadow-green-100",
    error: "border-red-400 shadow-red-100",
  };

  const stateIndicator: Record<string, string> = {
    idle: "bg-neutral-300",
    running: "bg-orange-500 animate-pulse",
    success: "bg-green-500",
    error: "bg-red-500",
  };

  return (
    <div
      onClick={() => selectNode(id)}
      className={`
        group relative bg-white rounded-xl border-2 shadow-sm
        transition-all duration-200 cursor-pointer min-w-[180px]
        hover:shadow-md
        ${stateStyles[data.executionState]}
        ${selected ? "ring-2 ring-orange-500 ring-offset-2" : ""}
      `}
    >
      {/* Input handles */}
      {def.maxInputs > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-neutral-400 !border-2 !border-white hover:!bg-orange-500 transition-colors"
        />
      )}

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-[10px]"
        style={{ backgroundColor: `${def.color}10` }}
      >
        <span className="text-sm">{def.icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: def.color }}>
          {def.label}
        </span>
        <div className={`ml-auto w-2 h-2 rounded-full ${stateIndicator[data.executionState]}`} />
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-neutral-800 truncate">{data.label}</p>
        {data.type === "claude-task" && data.config.prompt ? (
          <p className="text-xs text-neutral-400 mt-0.5 truncate">
            {String(data.config.prompt).slice(0, 50)}
          </p>
        ) : null}
        {data.type === "delay" ? (
          <p className="text-xs text-neutral-400 mt-0.5">
            {Number(data.config.delayMs) / 1000}s
          </p>
        ) : null}
        {data.type === "api" && data.config.url ? (
          <p className="text-xs text-neutral-400 mt-0.5 truncate">
            {String(data.config.method)} {String(data.config.url).slice(0, 30)}
          </p>
        ) : null}
      </div>

      {/* Error indicator */}
      {data.executionState === "error" && data.error && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-red-500 truncate">{data.error}</p>
        </div>
      )}

      {/* Output handles */}
      {data.type === "condition" ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-white !top-[35%]"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="!w-3 !h-3 !bg-red-500 !border-2 !border-white !top-[65%]"
          />
        </>
      ) : def.maxOutputs > 0 ? (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-neutral-400 !border-2 !border-white hover:!bg-orange-500 transition-colors"
        />
      ) : null}
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
