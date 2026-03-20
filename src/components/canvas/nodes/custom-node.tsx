"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { type NodeData, NODE_DEFINITIONS } from "@/types/workflow";
import { useWorkflowStore } from "@/stores/workflow-store";

function CustomNodeComponent({ id, data, selected }: NodeProps<Node<NodeData>>) {
  const def = NODE_DEFINITIONS[data.type];
  const selectNode = useWorkflowStore((s) => s.selectNode);

  const borderColor: Record<string, string> = {
    idle: "border-neutral-200",
    queued: "border-yellow-300",
    running: "border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.15)]",
    success: "border-green-400 shadow-[0_0_12px_rgba(34,197,94,0.1)]",
    error: "border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)]",
    skipped: "border-neutral-300 opacity-50",
  };

  const indicator: Record<string, string> = {
    idle: "bg-neutral-300",
    queued: "bg-yellow-400 animate-pulse",
    running: "bg-orange-500 animate-pulse",
    success: "bg-green-500",
    error: "bg-red-500",
    skipped: "bg-neutral-300",
  };

  const stateLabel: Record<string, string> = {
    idle: "",
    queued: "Queued",
    running: "Running...",
    success: "Done",
    error: "Failed",
    skipped: "Skipped",
  };

  const state = data.executionState;

  return (
    <div
      onClick={() => selectNode(id)}
      className={`
        group relative bg-white rounded-xl border-2 shadow-sm
        transition-all duration-300 cursor-pointer min-w-[200px] max-w-[240px]
        hover:shadow-md
        ${borderColor[state]}
        ${selected ? "ring-2 ring-orange-500 ring-offset-2" : ""}
      `}
    >
      {/* Input handles */}
      {def.maxInputs > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3.5 !h-3.5 !bg-neutral-300 !border-[3px] !border-white hover:!bg-orange-500 transition-colors !-left-[7px]"
        />
      )}

      {/* Header bar */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-b"
        style={{ borderColor: `${def.color}20` }}
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0"
          style={{ backgroundColor: `${def.color}12`, color: def.color }}
        >
          {def.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-900 truncate">{data.label}</p>
          <p className="text-[10px] text-neutral-400">{def.label}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {stateLabel[state] ? (
            <span className={`text-[9px] font-medium uppercase tracking-wider ${
              state === "running" ? "text-orange-500" :
              state === "success" ? "text-green-600" :
              state === "error" ? "text-red-500" :
              "text-neutral-400"
            }`}>
              {stateLabel[state]}
            </span>
          ) : null}
          <div className={`w-2.5 h-2.5 rounded-full ${indicator[state]}`} />
        </div>
      </div>

      {/* Body — shows relevant info based on type */}
      <div className="px-3 py-2">
        {data.type === "claude-task" ? (
          <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed font-mono">
            {String(data.config?.prompt || "No prompt set")}
          </p>
        ) : null}
        {data.type === "claude-review" ? (
          <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed font-mono">
            {String(data.config?.reviewPrompt || "Review output...")}
          </p>
        ) : null}
        {data.type === "gate" ? (
          <p className="text-[11px] text-neutral-500">
            {String(data.config?.condition || "not_empty")}: {String(data.config?.value || "—")}
          </p>
        ) : null}
        {data.type === "merge" ? (
          <p className="text-[11px] text-neutral-500">
            Strategy: {String(data.config?.strategy || "concat")}
          </p>
        ) : null}
        {data.type === "start" ? (
          <p className="text-[11px] text-neutral-500">
            Trigger: {String(data.config?.triggerType || "manual")}
          </p>
        ) : null}
        {data.type === "output" ? (
          <p className="text-[11px] text-neutral-500">
            Format: {String(data.config?.format || "raw")}
          </p>
        ) : null}
      </div>

      {/* Execution footer — shows duration + log count when executed */}
      {(state === "success" || state === "error" || state === "running") ? (
        <div className="px-3 py-1.5 border-t border-neutral-100 flex items-center justify-between">
          {data.durationMs ? (
            <span className="text-[10px] text-neutral-400">
              {(data.durationMs / 1000).toFixed(1)}s
            </span>
          ) : state === "running" ? (
            <span className="text-[10px] text-orange-400 animate-pulse">executing...</span>
          ) : null}
          {data.logCount ? (
            <span className="text-[10px] text-neutral-400">{data.logCount} logs</span>
          ) : null}
          {data.error ? (
            <span className="text-[10px] text-red-500 truncate max-w-[140px]">{data.error}</span>
          ) : null}
        </div>
      ) : null}

      {/* Output handles */}
      {data.type === "claude-review" || data.type === "gate" ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="pass"
            className="!w-3.5 !h-3.5 !bg-green-400 !border-[3px] !border-white !top-[35%] !-right-[7px]"
            title="Pass"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="fail"
            className="!w-3.5 !h-3.5 !bg-red-400 !border-[3px] !border-white !top-[65%] !-right-[7px]"
            title="Fail"
          />
        </>
      ) : def.maxOutputs > 0 ? (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3.5 !h-3.5 !bg-neutral-300 !border-[3px] !border-white hover:!bg-orange-500 transition-colors !-right-[7px]"
        />
      ) : null}

      {/* Running animation ring */}
      {state === "running" ? (
        <div className="absolute inset-0 rounded-xl border-2 border-orange-400 animate-ping opacity-20 pointer-events-none" />
      ) : null}
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
