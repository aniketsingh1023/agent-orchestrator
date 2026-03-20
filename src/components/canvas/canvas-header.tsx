"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWorkflowStore } from "@/stores/workflow-store";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExecutionState } from "@/types/workflow";

const STATUS_MAP: Record<string, ExecutionState> = {
  PENDING: "queued",
  RUNNING: "running",
  COMPLETED: "success",
  FAILED: "error",
};

export function CanvasHeader() {
  const {
    workflowId, workflowName, setWorkflowName, nodes, edges,
    isDirty, setWorkflow, isExecuting, setIsExecuting,
    executionId, setExecutionId, resetExecutionStates,
    setNodeExecutionState,
  } = useWorkflowStore();

  const [saving, setSaving] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  // ── Poll execution status ──
  useEffect(() => {
    if (!executionId || !workflowId || !isExecuting) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/canvas/workflows/${workflowId}/executions/${executionId}`);
        if (!res.ok) return;
        const data = await res.json();

        // Update each node's execution state
        for (const [nodeId, state] of Object.entries(data.nodeStates)) {
          const s = state as { status: string; output?: string; error?: string; durationMs?: number };
          setNodeExecutionState(nodeId, STATUS_MAP[s.status] || "idle", {
            output: s.output,
            error: s.error,
            durationMs: s.durationMs,
          });
        }

        // Stop polling when done
        if (data.status === "COMPLETED" || data.status === "FAILED") {
          setIsExecuting(false);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Ignore poll errors
      }
    };

    poll(); // immediate first poll
    pollRef.current = setInterval(poll, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [executionId, workflowId, isExecuting, setNodeExecutionState, setIsExecuting]);

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
    nodes.forEach((n) => setNodeExecutionState(n.id, "queued"));

    const res = await fetch(`/api/canvas/workflows/${workflowId}/execute`, { method: "POST" });
    if (!res.ok) {
      alert((await res.json()).error || "Failed to execute");
      setIsExecuting(false);
      return;
    }

    const data = await res.json();
    setExecutionId(data.executionId);

    if (!data.workerOnline) {
      alert("No CLI worker connected. Run 'ctrlai start' on your machine to execute tasks.");
    }
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200 shadow-lg px-5 py-2.5">
      <button onClick={() => router.push("/dashboard")} className="text-neutral-400 hover:text-neutral-600 text-sm font-medium">←</button>

      <Image src="/logo.jpeg" alt="CtrlAI" width={24} height={24} className="rounded-md shrink-0" />

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
          <><span className="w-2 h-2 rounded-full bg-white animate-pulse" />Running...</>
        ) : "▶ Execute"}
      </Button>
    </div>
  );
}
