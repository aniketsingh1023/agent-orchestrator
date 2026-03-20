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

  return (
    <div className="absolute top-0 right-0 z-10 w-80 h-full bg-white border-l border-neutral-200 shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ backgroundColor: `${def.color}15`, color: def.color }}
          >
            {def.icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-neutral-900">{def.label}</p>
            <p className="text-[10px] text-neutral-400">{def.description}</p>
          </div>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="text-neutral-400 hover:text-neutral-600 text-lg"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Label */}
        <div>
          <Label className="text-xs text-neutral-500">Node Label</Label>
          <Input
            value={node.data.label}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
            className="mt-1"
          />
        </div>

        <Separator />

        {/* Type-specific config */}
        {node.data.type === "start" && (
          <div>
            <Label className="text-xs text-neutral-500">Trigger Type</Label>
            <select
              value={String(node.data.config.triggerType || "manual")}
              onChange={(e) => updateNodeConfig(node.id, { triggerType: e.target.value })}
              className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="manual">Manual</option>
              <option value="schedule">Schedule (Cron)</option>
              <option value="webhook">Webhook</option>
            </select>
            {node.data.config.triggerType === "schedule" && (
              <div className="mt-3">
                <Label className="text-xs text-neutral-500">Cron Expression</Label>
                <Input
                  value={String(node.data.config.cronExpression || "")}
                  onChange={(e) => updateNodeConfig(node.id, { cronExpression: e.target.value })}
                  placeholder="*/5 * * * *"
                  className="mt-1 font-mono text-sm"
                />
              </div>
            )}
          </div>
        )}

        {node.data.type === "claude-task" && (
          <>
            <div>
              <Label className="text-xs text-neutral-500">Prompt</Label>
              <Textarea
                value={String(node.data.config.prompt || "")}
                onChange={(e) => updateNodeConfig(node.id, { prompt: e.target.value })}
                placeholder="Describe what the agent should do..."
                rows={6}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useContext"
                checked={Boolean(node.data.config.useContext)}
                onChange={(e) => updateNodeConfig(node.id, { useContext: e.target.checked })}
                className="rounded border-neutral-300"
              />
              <Label htmlFor="useContext" className="text-xs text-neutral-500">
                Use output from previous node as context
              </Label>
            </div>
            <div>
              <Label className="text-xs text-neutral-500">Max Tokens</Label>
              <Input
                type="number"
                value={Number(node.data.config.maxTokens || 4096)}
                onChange={(e) => updateNodeConfig(node.id, { maxTokens: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>
          </>
        )}

        {node.data.type === "api" && (
          <>
            <div>
              <Label className="text-xs text-neutral-500">Method</Label>
              <select
                value={String(node.data.config.method || "GET")}
                onChange={(e) => updateNodeConfig(node.id, { method: e.target.value })}
                className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <Label className="text-xs text-neutral-500">URL</Label>
              <Input
                value={String(node.data.config.url || "")}
                onChange={(e) => updateNodeConfig(node.id, { url: e.target.value })}
                placeholder="https://api.example.com/data"
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-500">Body (JSON)</Label>
              <Textarea
                value={String(node.data.config.body || "")}
                onChange={(e) => updateNodeConfig(node.id, { body: e.target.value })}
                placeholder='{"key": "value"}'
                rows={4}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </>
        )}

        {node.data.type === "condition" && (
          <>
            <div>
              <Label className="text-xs text-neutral-500">Expression</Label>
              <Textarea
                value={String(node.data.config.expression || "")}
                onChange={(e) => updateNodeConfig(node.id, { expression: e.target.value })}
                placeholder='input.status === "success"'
                rows={3}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                JS expression. Access previous node output via `input`.
              </p>
            </div>
          </>
        )}

        {node.data.type === "delay" && (
          <div>
            <Label className="text-xs text-neutral-500">Delay (seconds)</Label>
            <Input
              type="number"
              value={Number(node.data.config.delayMs || 5000) / 1000}
              onChange={(e) => updateNodeConfig(node.id, { delayMs: parseFloat(e.target.value) * 1000 })}
              min={0}
              step={0.5}
              className="mt-1"
            />
          </div>
        )}

        {node.data.type === "output" && (
          <div>
            <Label className="text-xs text-neutral-500">Output Format</Label>
            <select
              value={String(node.data.config.format || "raw")}
              onChange={(e) => updateNodeConfig(node.id, { format: e.target.value })}
              className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="raw">Raw Text</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
        )}

        {/* Execution output */}
        {node.data.output && (
          <>
            <Separator />
            <div>
              <Label className="text-xs text-neutral-500">Last Output</Label>
              <pre className="mt-1 p-3 bg-neutral-50 rounded-lg text-xs font-mono text-neutral-700 max-h-40 overflow-auto whitespace-pre-wrap">
                {node.data.output}
              </pre>
            </div>
          </>
        )}

        <Separator />

        {/* Delete */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            removeNode(node.id);
            selectNode(null);
          }}
          className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          Delete Node
        </Button>
      </div>
    </div>
  );
}
