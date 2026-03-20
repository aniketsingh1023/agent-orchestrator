export type NodeType = "start" | "claude-task" | "api" | "condition" | "delay" | "output";

export type ExecutionState = "idle" | "running" | "success" | "error";

export interface NodeData {
  label: string;
  type: NodeType;
  config: Record<string, unknown>;
  executionState: ExecutionState;
  output?: string;
  error?: string;
  [key: string]: unknown;
}

// Node-specific configs
export interface StartNodeConfig {
  triggerType: "manual" | "schedule" | "webhook";
  cronExpression?: string;
}

export interface ClaudeTaskNodeConfig {
  prompt: string;
  model: string;
  maxTokens: number;
  useContext: boolean; // use output from previous node as context
}

export interface ApiNodeConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers: Record<string, string>;
  body?: string;
}

export interface ConditionNodeConfig {
  expression: string; // JS expression evaluated against input
  trueLabel: string;
  falseLabel: string;
}

export interface DelayNodeConfig {
  delayMs: number;
}

export interface OutputNodeConfig {
  format: "raw" | "json" | "markdown";
}

export const NODE_DEFINITIONS: Record<
  NodeType,
  {
    label: string;
    description: string;
    color: string;
    icon: string;
    defaultConfig: Record<string, unknown>;
    maxInputs: number;
    maxOutputs: number;
  }
> = {
  start: {
    label: "Start",
    description: "Trigger point for the workflow",
    color: "#22c55e",
    icon: "▶",
    defaultConfig: { triggerType: "manual" },
    maxInputs: 0,
    maxOutputs: 1,
  },
  "claude-task": {
    label: "Claude Task",
    description: "Run a Claude Code agent",
    color: "#f97316",
    icon: "⚡",
    defaultConfig: { prompt: "", model: "claude-code", maxTokens: 4096, useContext: true },
    maxInputs: 5,
    maxOutputs: 1,
  },
  api: {
    label: "API Call",
    description: "Make an HTTP request",
    color: "#3b82f6",
    icon: "🌐",
    defaultConfig: { url: "", method: "GET", headers: {}, body: "" },
    maxInputs: 1,
    maxOutputs: 1,
  },
  condition: {
    label: "Condition",
    description: "Branch based on a condition",
    color: "#a855f7",
    icon: "◆",
    defaultConfig: { expression: "", trueLabel: "True", falseLabel: "False" },
    maxInputs: 1,
    maxOutputs: 2,
  },
  delay: {
    label: "Delay",
    description: "Wait before continuing",
    color: "#64748b",
    icon: "⏱",
    defaultConfig: { delayMs: 5000 },
    maxInputs: 1,
    maxOutputs: 1,
  },
  output: {
    label: "Output",
    description: "Final workflow output",
    color: "#ef4444",
    icon: "⬤",
    defaultConfig: { format: "raw" },
    maxInputs: 5,
    maxOutputs: 0,
  },
};
