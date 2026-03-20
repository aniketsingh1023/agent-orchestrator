"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWorkflowStore } from "@/stores/workflow-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RuntimeEvent } from "@/lib/agents/claude-runtime";

export function CanvasHeader() {
  const {
    workflowId, workflowName, setWorkflowName, nodes, edges,
    isDirty, setWorkflow, isExecuting, setIsExecuting,
    executionId, setExecutionId, resetExecutionStates,
    setNodeExecutionState,
  } = useWorkflowStore();

  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // ── WebSocket: live execution updates ──
  const connectWs = useCallback((execId: string) => {
    const wsUrl = `ws://localhost:${process.env.NEXT_PUBLIC_WS_PORT || "3002"}?executionId=${execId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (msg) => {
      const event: RuntimeEvent = JSON.parse(msg.data);

      if (event.nodeId === "__workflow__") {
        setIsExecuting(false);
        return;
      }

      switch (event.type) {
        case "task_started":
          setNodeExecutionState(event.nodeId, "running");
          break;
        case "task_completed":
          setNodeExecutionState(event.nodeId, "success", {
            output: String(event.data.output || ""),
            durationMs: Number(event.data.durationMs || 0),
          });
          break;
        case "task_failed":
          setNodeExecutionState(event.nodeId, "error", {
            error: String(event.data.error || "Failed"),
          });
          break;
      }
    };

    ws.onclose = () => setIsExecuting(false);

    return ws;
  }, [setIsExecuting, setNodeExecutionState]);

  // Reconnect on execution
  useEffect(() => {
    if (!executionId || !isExecuting) return;
    const ws = connectWs(executionId);
    return () => ws.close();
  }, [executionId, isExecuting, connectWs]);

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        name: workflowName,
        nodes: nodes.map((n) => ({
          id: n.id, type: n.data.type, label: n.data.label,
          config: n.data.config, position: n.position,
        })),
        edges: edges.map((e) => ({
          id: e.id, source: e.source, target: e.target,
          sourceHandle: e.sourceHandle, targetHandle: e.targetHandle,
        })),
      };

      const url = workflowId ? `/api/canvas/workflows/${workflowId}` : "/api/canvas/workflows";
      const method = workflowId ? "PUT" : "POST";

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { alert((await res.json()).error || "Failed to save"); return; }

      const data = await res.json();
      setWorkflow(data.id, data.name, nodes, edges);
    } finally { setSaving(false); }
  }

  async function handleRun() {
    if (!workflowId) { alert("Save the workflow first"); return; }

    resetExecutionStates();
    setIsExecuting(true);

    // Mark all nodes as queued
    nodes.forEach((n) => setNodeExecutionState(n.id, "queued"));

    const res = await fetch(`/api/canvas/workflows/${workflowId}/execute`, { method: "POST" });
    if (!res.ok) {
      alert((await res.json()).error || "Failed to execute");
      setIsExecuting(false);
      return;
    }

    const data = await res.json();
    setExecutionId(data.executionId);
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200 shadow-lg px-5 py-2.5">
      <button onClick={() => router.push("/dashboard")} className="text-neutral-400 hover:text-neutral-600 text-sm font-medium">
        ←
      </button>

      <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
        <span className="text-white font-bold text-[10px]">C</span>
      </div>

      <Input
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        className="border-0 bg-transparent font-semibold text-neutral-900 w-48 text-center p-0 h-auto focus-visible:ring-0"
      />

      {isDirty ? <span className="w-2 h-2 rounded-full bg-orange-400" title="Unsaved" /> : null}

      <div className="w-px h-5 bg-neutral-200" />

      <Button size="sm" variant="outline" onClick={handleSave} disabled={saving} className="text-xs h-8">
        {saving ? "Saving..." : "Save"}
      </Button>

      <Button
        size="sm"
        onClick={handleRun}
        disabled={isExecuting || !workflowId}
        className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 gap-1.5"
      >
        {isExecuting ? (
          <>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Running...
          </>
        ) : (
          "▶ Execute"
        )}
      </Button>
    </div>
  );
}
