import { spawn } from "child_process";

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  logs: Array<{ stream: "stdout" | "stderr" | "system"; content: string; timestamp: string }>;
  durationMs: number;
}

/**
 * Execute a Claude Code task.
 *
 * Builds the prompt with upstream context, spawns `claude --print`,
 * captures all output, returns structured result.
 */
export async function executeClaudeTask(
  prompt: string,
  upstreamOutputs: Record<string, string>,
  onLog: (stream: "stdout" | "stderr" | "system", line: string) => void
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const logs: ExecutionResult["logs"] = [];

  // Build prompt with upstream context
  let fullPrompt = prompt;
  const upstreamEntries = Object.entries(upstreamOutputs);
  if (upstreamEntries.length > 0) {
    const contextBlock = upstreamEntries
      .map(([name, output]) => `<upstream node="${name}">\n${output}\n</upstream>`)
      .join("\n\n");
    fullPrompt = `Context from previous workflow steps:\n\n${contextBlock}\n\nYour task:\n\n${prompt}`;
  }

  const addLog = (stream: "stdout" | "stderr" | "system", content: string) => {
    logs.push({ stream, content, timestamp: new Date().toISOString() });
    onLog(stream, content);
  };

  addLog("system", `Executing Claude Code task...`);
  addLog("system", `Prompt: ${prompt.slice(0, 100)}${prompt.length > 100 ? "..." : ""}`);
  if (upstreamEntries.length > 0) {
    addLog("system", `With context from ${upstreamEntries.length} upstream node(s)`);
  }

  return new Promise((resolve) => {
    const proc = spawn("claude", ["--print", fullPrompt], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stdout += text;
      // Emit line by line
      const lines = text.split("\n");
      for (const line of lines) {
        if (line.trim()) addLog("stdout", line);
      }
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      const lines = text.split("\n");
      for (const line of lines) {
        if (line.trim()) addLog("stderr", line);
      }
    });

    proc.on("close", (exitCode) => {
      const durationMs = Date.now() - startTime;
      const success = exitCode === 0;

      if (success) {
        addLog("system", `Completed in ${(durationMs / 1000).toFixed(1)}s`);
      } else {
        addLog("system", `Failed with exit code ${exitCode} after ${(durationMs / 1000).toFixed(1)}s`);
      }

      resolve({
        success,
        output: stdout.trim(),
        error: success ? undefined : stderr.trim() || `Exit code: ${exitCode}`,
        logs,
        durationMs,
      });
    });

    proc.on("error", (err) => {
      const durationMs = Date.now() - startTime;
      addLog("system", `Failed to spawn Claude: ${err.message}`);

      resolve({
        success: false,
        output: "",
        error: `Failed to spawn Claude CLI: ${err.message}. Is 'claude' installed and in PATH?`,
        logs,
        durationMs,
      });
    });
  });
}

/**
 * Handle non-Claude node types (start, gate, merge, output).
 * These execute locally without calling Claude.
 */
export function executeBuiltinNode(
  nodeType: string,
  prompt: string,
  upstreamOutputs: Record<string, string>
): ExecutionResult {
  const startTime = Date.now();
  const input = Object.values(upstreamOutputs).join("\n\n");

  if (nodeType === "start") {
    return {
      success: true,
      output: "Workflow started",
      logs: [{ stream: "system", content: "Start node triggered", timestamp: new Date().toISOString() }],
      durationMs: Date.now() - startTime,
    };
  }

  if (nodeType === "gate") {
    let config: Record<string, string> = {};
    try { config = JSON.parse(prompt); } catch { /* */ }
    const condition = config.condition || "not_empty";
    const value = config.value || "";
    let pass = false;

    switch (condition) {
      case "contains": pass = input.includes(value); break;
      case "not_contains": pass = !input.includes(value); break;
      case "equals": pass = input.trim() === value.trim(); break;
      case "not_empty": pass = input.trim().length > 0; break;
      default: pass = input.trim().length > 0;
    }

    return {
      success: true,
      output: pass ? "PASS" : "FAIL",
      logs: [{ stream: "system", content: `Gate: ${condition} → ${pass ? "PASS" : "FAIL"}`, timestamp: new Date().toISOString() }],
      durationMs: Date.now() - startTime,
    };
  }

  if (nodeType === "merge") {
    let config: Record<string, string> = {};
    try { config = JSON.parse(prompt); } catch { /* */ }
    const strategy = config.strategy || "concat";
    const separator = config.separator || "\n\n---\n\n";
    let merged: string;

    switch (strategy) {
      case "json_merge":
        merged = JSON.stringify(upstreamOutputs);
        break;
      case "latest":
        merged = Object.values(upstreamOutputs).pop() || "";
        break;
      default:
        merged = Object.values(upstreamOutputs).join(separator);
    }

    return {
      success: true,
      output: merged,
      logs: [{ stream: "system", content: `Merged ${Object.keys(upstreamOutputs).length} outputs (${strategy})`, timestamp: new Date().toISOString() }],
      durationMs: Date.now() - startTime,
    };
  }

  if (nodeType === "output") {
    return {
      success: true,
      output: input,
      logs: [{ stream: "system", content: "Output collected", timestamp: new Date().toISOString() }],
      durationMs: Date.now() - startTime,
    };
  }

  return {
    success: false,
    output: "",
    error: `Unknown node type: ${nodeType}`,
    logs: [{ stream: "system", content: `Unknown node type: ${nodeType}`, timestamp: new Date().toISOString() }],
    durationMs: Date.now() - startTime,
  };
}
