import { spawn } from "child_process";
import type { AgentProvider, AgentResult } from "./provider";

export class ClaudeCodeProvider implements AgentProvider {
  name = "claude-code";

  async execute(
    prompt: string,
    onLog: (stream: "stdout" | "stderr" | "system", content: string) => Promise<void>,
    signal?: AbortSignal
  ): Promise<AgentResult> {
    await onLog("system", `Starting Claude Code with prompt: ${prompt.slice(0, 100)}...`);

    return new Promise((resolve) => {
      const proc = spawn("claude", ["--print", prompt], {
        stdio: ["ignore", "pipe", "pipe"],
        signal,
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", async (data: Buffer) => {
        const text = data.toString();
        stdout += text;
        await onLog("stdout", text);
      });

      proc.stderr.on("data", async (data: Buffer) => {
        const text = data.toString();
        stderr += text;
        await onLog("stderr", text);
      });

      proc.on("close", async (code) => {
        if (code === 0) {
          await onLog("system", "Claude Code completed successfully");
          resolve({ success: true, output: stdout });
        } else {
          await onLog("system", `Claude Code exited with code ${code}`);
          resolve({ success: false, output: stdout, error: stderr || `Exit code: ${code}` });
        }
      });

      proc.on("error", async (err) => {
        await onLog("system", `Failed to spawn Claude Code: ${err.message}`);
        resolve({ success: false, output: "", error: err.message });
      });
    });
  }
}
