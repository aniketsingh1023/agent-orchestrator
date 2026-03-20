"use client";

import { useWorkflowStore } from "@/stores/workflow-store";
import { NODE_DEFINITIONS } from "@/types/workflow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function ConfigPanel() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const selectNode = useWorkflowStore((s) => s.selectNode);

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const def = NODE_DEFINITIONS[node.data.type];
  const cfg = node.data.config as Record<string, unknown>;

  return (
    <div className="absolute top-0 right-0 z-10 w-80 h-full bg-white/95 backdrop-blur-sm border-l border-neutral-200 shadow-xl overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{ backgroundColor: `${def.color}12`, color: def.color }}
          >
            {def.icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-neutral-900">{def.label}</p>
            <p className="text-[10px] text-neutral-400">{def.description}</p>
          </div>
        </div>
        <button onClick={() => selectNode(null)} className="text-neutral-400 hover:text-neutral-600 text-lg leading-none">×</button>
      </div>

      <div className="p-4 space-y-4">
        {/* Label */}
        <div>
          <Label className="text-xs text-neutral-500">Node Label</Label>
          <Input value={node.data.label} onChange={(e) => updateNodeData(node.id, { label: e.target.value })} className="mt-1" />
        </div>

        <Separator />

        {/* ── Start ── */}
        {node.data.type === "start" && (
          <div>
            <Label className="text-xs text-neutral-500">Trigger Type</Label>
            <select value={String(cfg.triggerType || "manual")} onChange={(e) => updateNodeConfig(node.id, { triggerType: e.target.value })}
              className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="manual">Manual</option>
              <option value="schedule">Schedule (Cron)</option>
              <option value="webhook">Webhook</option>
            </select>
          </div>
        )}

        {/* ── Claude Task ── */}
        {node.data.type === "claude-task" && (
          <>
            <div>
              <Label className="text-xs text-neutral-500">Prompt for Claude</Label>
              <Textarea
                value={String(cfg.prompt || "")}
                onChange={(e) => updateNodeConfig(node.id, { prompt: e.target.value })}
                placeholder="Write tests for the auth module..."
                rows={8}
                className="mt-1 font-mono text-xs leading-relaxed"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                This prompt is sent directly to Claude Code. If &quot;Use upstream context&quot; is on, outputs from previous nodes are injected automatically.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="useCtx" checked={Boolean(cfg.useUpstreamContext)}
                onChange={(e) => updateNodeConfig(node.id, { useUpstreamContext: e.target.checked })}
                className="rounded border-neutral-300" />
              <Label htmlFor="useCtx" className="text-xs text-neutral-600">Use upstream context</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-neutral-500">Max Retries</Label>
                <Input type="number" value={Number(cfg.maxRetries || 2)} min={0} max={5}
                  onChange={(e) => updateNodeConfig(node.id, { maxRetries: parseInt(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-neutral-500">Retry Delay (s)</Label>
                <Input type="number" value={Number(cfg.retryDelayMs || 5000) / 1000} min={1} max={60}
                  onChange={(e) => updateNodeConfig(node.id, { retryDelayMs: parseFloat(e.target.value) * 1000 })} className="mt-1" />
              </div>
            </div>
          </>
        )}

        {/* ── Claude Review ── */}
        {node.data.type === "claude-review" && (
          <>
            <div>
              <Label className="text-xs text-neutral-500">Review Prompt</Label>
              <Textarea
                value={String(cfg.reviewPrompt || "")}
                onChange={(e) => updateNodeConfig(node.id, { reviewPrompt: e.target.value })}
                placeholder="Review this code for security vulnerabilities..."
                rows={5}
                className="mt-1 font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-500">Pass Condition</Label>
              <Input value={String(cfg.passCondition || "")}
                onChange={(e) => updateNodeConfig(node.id, { passCondition: e.target.value })}
                placeholder="approved" className="mt-1 text-sm" />
              <p className="text-[10px] text-neutral-400 mt-1">
                If Claude&apos;s review contains this text, the node passes. Otherwise it fails.
              </p>
            </div>
          </>
        )}

        {/* ── Gate ── */}
        {node.data.type === "gate" && (
          <>
            <div>
              <Label className="text-xs text-neutral-500">Condition</Label>
              <select value={String(cfg.condition || "not_empty")}
                onChange={(e) => updateNodeConfig(node.id, { condition: e.target.value })}
                className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="not_empty">Output is not empty</option>
                <option value="contains">Output contains...</option>
                <option value="not_contains">Output does not contain...</option>
                <option value="equals">Output equals...</option>
              </select>
            </div>
            {(cfg.condition === "contains" || cfg.condition === "not_contains" || cfg.condition === "equals") ? (
              <div>
                <Label className="text-xs text-neutral-500">Value</Label>
                <Input value={String(cfg.value || "")} onChange={(e) => updateNodeConfig(node.id, { value: e.target.value })} className="mt-1" />
              </div>
            ) : null}
          </>
        )}

        {/* ── Merge ── */}
        {node.data.type === "merge" && (
          <div>
            <Label className="text-xs text-neutral-500">Merge Strategy</Label>
            <select value={String(cfg.strategy || "concat")}
              onChange={(e) => updateNodeConfig(node.id, { strategy: e.target.value })}
              className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="concat">Concatenate outputs</option>
              <option value="json_merge">Merge as JSON object</option>
              <option value="latest">Use latest output only</option>
            </select>
          </div>
        )}

        {/* ── Output ── */}
        {node.data.type === "output" && (
          <div>
            <Label className="text-xs text-neutral-500">Output Format</Label>
            <select value={String(cfg.format || "raw")}
              onChange={(e) => updateNodeConfig(node.id, { format: e.target.value })}
              className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="raw">Raw Text</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
              <option value="summary">AI Summary (Claude summarizes)</option>
            </select>
          </div>
        )}

        {/* ── Execution Output ── */}
        {node.data.output ? (
          <>
            <Separator />
            <div>
              <Label className="text-xs text-neutral-500">Last Output</Label>
              <pre className="mt-1 p-3 bg-neutral-900 rounded-lg text-[11px] font-mono text-green-400 max-h-48 overflow-auto whitespace-pre-wrap leading-relaxed">
                {node.data.output}
              </pre>
            </div>
          </>
        ) : null}

        {node.data.error ? (
          <>
            <Separator />
            <div>
              <Label className="text-xs text-red-500">Error</Label>
              <pre className="mt-1 p-3 bg-red-50 rounded-lg text-[11px] font-mono text-red-600 max-h-32 overflow-auto whitespace-pre-wrap">
                {node.data.error}
              </pre>
            </div>
          </>
        ) : null}

        <Separator />

        <Button variant="outline" size="sm"
          onClick={() => { removeNode(node.id); selectNode(null); }}
          className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
          Delete Node
        </Button>
      </div>
    </div>
  );
}
