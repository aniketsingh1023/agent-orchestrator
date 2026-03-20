"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkflowStore } from "@/stores/workflow-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CanvasHeader() {
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const isDirty = useWorkflowStore((s) => s.isDirty);
  const setWorkflow = useWorkflowStore((s) => s.setWorkflow);
  const resetExecutionStates = useWorkflowStore((s) => s.resetExecutionStates);

  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        name: workflowName,
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.data.type,
          label: n.data.label,
          config: n.data.config,
          position: n.position,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        })),
      };

      const url = workflowId
        ? `/api/canvas/workflows/${workflowId}`
        : "/api/canvas/workflows";
      const method = workflowId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to save");
        return;
      }

      const data = await res.json();
      setWorkflow(data.id, data.name, nodes, edges);
    } finally {
      setSaving(false);
    }
  }

  async function handleRun() {
    if (!workflowId) {
      alert("Save the workflow first");
      return;
    }

    setRunning(true);
    resetExecutionStates();

    try {
      const res = await fetch(`/api/canvas/workflows/${workflowId}/execute`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to execute");
        return;
      }

      // Execution started — polling will handle status updates
      router.refresh();
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-white rounded-xl border border-neutral-200 shadow-lg px-4 py-2">
      <button
        onClick={() => router.push("/dashboard/workflows")}
        className="text-neutral-400 hover:text-neutral-600 text-sm"
      >
        ←
      </button>

      <Input
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        className="border-0 bg-transparent font-semibold text-neutral-900 w-48 text-center p-0 h-auto focus-visible:ring-0"
      />

      {isDirty && (
        <span className="w-2 h-2 rounded-full bg-orange-400" title="Unsaved changes" />
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={handleSave}
        disabled={saving}
        className="text-xs"
      >
        {saving ? "Saving..." : "Save"}
      </Button>

      <Button
        size="sm"
        onClick={handleRun}
        disabled={running || !workflowId}
        className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
      >
        {running ? "Running..." : "▶ Run"}
      </Button>
    </div>
  );
}
