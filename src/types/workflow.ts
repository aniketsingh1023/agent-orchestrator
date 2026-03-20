/**
 * CtrlAI — Node Type System
 *
 * Every node type serves the Claude Code orchestration story.
 * No generic automation nodes. This is a Claude execution platform.
 */

export type NodeType =
  | "start"        // Workflow trigger
  | "claude-task"  // THE core node — runs Claude Code
  | "claude-review"// Claude reviews output of previous node
  | "gate"         // Pass/fail check on output
  | "merge"        // Combine parallel branch outputs
  | "output";      // Final result collection

export type ExecutionState = "idle" | "queued" | "running" | "success" | "error" | "skipped";

export interface NodeData {
  label: string;
  type: NodeType;
  config: Record<string, unknown>;
  executionState: ExecutionState;
  output?: string;
  error?: string;
  durationMs?: number;
  logCount?: number;
  [key: string]: unknown;
}

// ── Node Configs ──────────────────────────

export type NodeConfig =
  | StartNodeConfig
  | ClaudeTaskConfig
  | ClaudeReviewConfig
  | GateConfig
  | MergeConfig
  | OutputConfig;

export interface StartNodeConfig {
  nodeType: "start";
  triggerType: "manual" | "schedule" | "webhook";
  cronExpression?: string;
}

export interface ClaudeTaskConfig {
  nodeType: "claude-task";
  prompt: string;
  useUpstreamContext: boolean; // Inject output from upstream nodes
  workingDirectory?: string;
  maxRetries: number;
  retryDelayMs: number;
}

export interface ClaudeReviewConfig {
  nodeType: "claude-review";
  reviewPrompt: string; // "Review this code for bugs..."
  passCondition: string; // "approved" | "no issues found" etc
  maxRetries: number;
  retryDelayMs: number;
}

export interface GateConfig {
  nodeType: "gate";
  condition: "contains" | "not_contains" | "equals" | "not_empty" | "custom";
  value: string; // What to check for
  customExpression?: string; // For "custom" condition
}

export interface MergeConfig {
  nodeType: "merge";
  strategy: "concat" | "json_merge" | "latest";
  separator?: string;
}

export interface OutputConfig {
  nodeType: "output";
  format: "raw" | "json" | "markdown" | "summary";
  summaryPrompt?: string; // If format=summary, Claude summarizes the final output
}

// ── Node Definitions (for toolbar + rendering) ──────────────────────────

export const NODE_DEFINITIONS: Record<
  NodeType,
  {
    label: string;
    description: string;
    color: string;
    icon: string;
    defaultConfig: NodeConfig;
    maxInputs: number;
    maxOutputs: number;
  }
> = {
  start: {
    label: "Start",
    description: "Trigger the workflow",
    color: "#22c55e",
    icon: "▶",
    defaultConfig: { nodeType: "start", triggerType: "manual" },
    maxInputs: 0,
    maxOutputs: 1,
  },
  "claude-task": {
    label: "Claude Task",
    description: "Execute a Claude Code agent task",
    color: "#f97316",
    icon: "⚡",
    defaultConfig: {
      nodeType: "claude-task",
      prompt: "",
      useUpstreamContext: true,
      maxRetries: 2,
      retryDelayMs: 5000,
    },
    maxInputs: 5,
    maxOutputs: 1,
  },
  "claude-review": {
    label: "Claude Review",
    description: "Claude reviews the output of the previous step",
    color: "#8b5cf6",
    icon: "🔍",
    defaultConfig: {
      nodeType: "claude-review",
      reviewPrompt: "Review the following output for quality and correctness.",
      passCondition: "approved",
      maxRetries: 1,
      retryDelayMs: 3000,
    },
    maxInputs: 1,
    maxOutputs: 2, // pass / fail
  },
  gate: {
    label: "Gate",
    description: "Check if output meets criteria",
    color: "#eab308",
    icon: "⚑",
    defaultConfig: {
      nodeType: "gate",
      condition: "not_empty",
      value: "",
    },
    maxInputs: 1,
    maxOutputs: 2, // pass / fail
  },
  merge: {
    label: "Merge",
    description: "Combine outputs from parallel branches",
    color: "#64748b",
    icon: "⊕",
    defaultConfig: {
      nodeType: "merge",
      strategy: "concat",
      separator: "\n\n---\n\n",
    },
    maxInputs: 10,
    maxOutputs: 1,
  },
  output: {
    label: "Output",
    description: "Collect the final workflow result",
    color: "#ef4444",
    icon: "⬤",
    defaultConfig: {
      nodeType: "output",
      format: "raw",
    },
    maxInputs: 5,
    maxOutputs: 0,
  },
};
