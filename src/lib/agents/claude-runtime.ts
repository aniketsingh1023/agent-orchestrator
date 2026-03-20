import { spawn, type ChildProcess } from "child_process";
import { EventEmitter } from "events";

/**
 * Claude Runtime Controller
 *
 * This is the core execution layer. It doesn't just spawn Claude —
 * it manages the full lifecycle:
 *
 * 1. Builds the prompt with context from upstream nodes
 * 2. Spawns `claude` CLI with proper isolation
 * 3. Streams stdout/stderr in real-time (line-by-line)
 * 4. Detects completion or failure
 * 5. Parses output and passes it to the next node
 * 6. Handles retries with backoff
 */

export interface RuntimeEvent {
  type: "task_started" | "task_output" | "task_completed" | "task_failed";
  nodeId: string;
  executionId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface TaskContext {
  nodeId: string;
  executionId: string;
  prompt: string;
  upstreamOutputs: Map<string, string>; // nodeId → output from completed upstream nodes
  workingDirectory?: string;
  maxRetries: number;
  retryDelayMs: number;
}

export interface TaskResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number | null;
  durationMs: number;
}

export class ClaudeRuntimeController extends EventEmitter {
  private activeProcesses = new Map<string, ChildProcess>();

  /**
   * Build the full prompt by injecting context from upstream nodes.
   * This is what makes the workflow actually useful — each Claude task
   * sees what the previous tasks produced.
   */
  private buildPrompt(ctx: TaskContext): string {
    let fullPrompt = ctx.prompt;

    if (ctx.upstreamOutputs.size > 0) {
      const contextBlock = Array.from(ctx.upstreamOutputs.entries())
        .map(([nodeId, output]) => `<upstream_output node="${nodeId}">\n${output}\n</upstream_output>`)
        .join("\n\n");

      fullPrompt = `Here is the output from previous steps in this workflow:\n\n${contextBlock}\n\nNow, your task:\n\n${ctx.prompt}`;
    }

    return fullPrompt;
  }

  /**
   * Execute a Claude Code task. This is the heart of the system.
   */
  async execute(
    ctx: TaskContext,
    onEvent: (event: RuntimeEvent) => void
  ): Promise<TaskResult> {
    const startTime = Date.now();
    const fullPrompt = this.buildPrompt(ctx);

    // Emit started
    onEvent({
      type: "task_started",
      nodeId: ctx.nodeId,
      executionId: ctx.executionId,
      timestamp: Date.now(),
      data: { prompt: fullPrompt.slice(0, 200) },
    });

    return new Promise((resolve) => {
      const args = ["--print", fullPrompt];

      const proc = spawn("claude", args, {
        stdio: ["ignore", "pipe", "pipe"],
        cwd: ctx.workingDirectory || process.cwd(),
        env: { ...process.env },
      });

      this.activeProcesses.set(ctx.nodeId, proc);

      let stdout = "";
      let stderr = "";
      let stdoutBuffer = "";
      let stderrBuffer = "";

      // Stream stdout line-by-line for real-time updates
      proc.stdout.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        stdout += text;
        stdoutBuffer += text;

        // Flush complete lines
        const lines = stdoutBuffer.split("\n");
        stdoutBuffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            onEvent({
              type: "task_output",
              nodeId: ctx.nodeId,
              executionId: ctx.executionId,
              timestamp: Date.now(),
              data: { stream: "stdout", content: line },
            });
          }
        }
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        stderr += text;
        stderrBuffer += text;

        const lines = stderrBuffer.split("\n");
        stderrBuffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            onEvent({
              type: "task_output",
              nodeId: ctx.nodeId,
              executionId: ctx.executionId,
              timestamp: Date.now(),
              data: { stream: "stderr", content: line },
            });
          }
        }
      });

      proc.on("close", (exitCode) => {
        this.activeProcesses.delete(ctx.nodeId);
        const durationMs = Date.now() - startTime;

        // Flush remaining buffers
        if (stdoutBuffer.trim()) {
          onEvent({
            type: "task_output",
            nodeId: ctx.nodeId,
            executionId: ctx.executionId,
            timestamp: Date.now(),
            data: { stream: "stdout", content: stdoutBuffer },
          });
        }
        if (stderrBuffer.trim()) {
          onEvent({
            type: "task_output",
            nodeId: ctx.nodeId,
            executionId: ctx.executionId,
            timestamp: Date.now(),
            data: { stream: "stderr", content: stderrBuffer },
          });
        }

        const success = exitCode === 0;
        const result: TaskResult = {
          success,
          output: stdout.trim(),
          error: success ? undefined : stderr.trim() || `Exit code: ${exitCode}`,
          exitCode,
          durationMs,
        };

        onEvent({
          type: success ? "task_completed" : "task_failed",
          nodeId: ctx.nodeId,
          executionId: ctx.executionId,
          timestamp: Date.now(),
          data: {
            output: result.output.slice(0, 5000),
            error: result.error,
            exitCode,
            durationMs,
          },
        });

        resolve(result);
      });

      proc.on("error", (err) => {
        this.activeProcesses.delete(ctx.nodeId);
        const durationMs = Date.now() - startTime;

        const result: TaskResult = {
          success: false,
          output: "",
          error: `Failed to spawn Claude: ${err.message}`,
          exitCode: null,
          durationMs,
        };

        onEvent({
          type: "task_failed",
          nodeId: ctx.nodeId,
          executionId: ctx.executionId,
          timestamp: Date.now(),
          data: { error: result.error },
        });

        resolve(result);
      });
    });
  }

  /**
   * Execute with retry and exponential backoff.
   */
  async executeWithRetry(
    ctx: TaskContext,
    onEvent: (event: RuntimeEvent) => void
  ): Promise<TaskResult> {
    let lastResult: TaskResult | null = null;

    for (let attempt = 0; attempt <= ctx.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = ctx.retryDelayMs * Math.pow(2, attempt - 1);
        onEvent({
          type: "task_output",
          nodeId: ctx.nodeId,
          executionId: ctx.executionId,
          timestamp: Date.now(),
          data: {
            stream: "system",
            content: `Retry ${attempt}/${ctx.maxRetries} after ${delay}ms...`,
          },
        });
        await new Promise((r) => setTimeout(r, delay));
      }

      lastResult = await this.execute(ctx, onEvent);
      if (lastResult.success) return lastResult;
    }

    return lastResult!;
  }

  /**
   * Cancel a running task.
   */
  cancel(nodeId: string): boolean {
    const proc = this.activeProcesses.get(nodeId);
    if (proc) {
      proc.kill("SIGTERM");
      this.activeProcesses.delete(nodeId);
      return true;
    }
    return false;
  }

  /**
   * Cancel all running tasks (workflow cancelled).
   */
  cancelAll(): void {
    for (const [nodeId, proc] of this.activeProcesses) {
      proc.kill("SIGTERM");
      this.activeProcesses.delete(nodeId);
    }
  }
}

// Singleton instance for the worker process
export const claudeRuntime = new ClaudeRuntimeController();
