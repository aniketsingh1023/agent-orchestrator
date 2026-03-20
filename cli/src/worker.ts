import { getConfig } from "./config.js";
import { executeClaudeTask, executeBuiltinNode } from "./executor.js";

interface PollResponse {
  task: null | {
    stepExecutionId: string;
    executionId: string;
    nodeType: string;
    name: string;
    prompt: string;
    upstreamOutputs: Record<string, string>;
    maxRetries: number;
    retryDelayMs: number;
    attempt: number;
  };
}

/**
 * Worker loop. Polls for tasks, executes them, sends results back.
 *
 * This is the core of the CLI. It runs continuously:
 * 1. Poll backend for next task
 * 2. If task found → execute it
 * 3. Send result back
 * 4. Repeat
 *
 * If no task → wait 2 seconds → poll again
 */
export async function startWorker(): Promise<void> {
  const config = getConfig();
  if (!config?.apiKey) {
    console.error("Not connected. Run: ctrlai connect <server-url> <api-key>");
    process.exit(1);
  }

  const { serverUrl, apiKey, workerName } = config;
  console.log(`\n⚡ CtrlAI Worker started`);
  console.log(`   Name: ${workerName}`);
  console.log(`   Server: ${serverUrl}`);
  console.log(`   Polling for tasks...\n`);

  let consecutive404 = 0;

  while (true) {
    try {
      // ── Poll for task ──
      const pollRes = await fetch(`${serverUrl}/api/workers/poll`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!pollRes.ok) {
        if (pollRes.status === 401) {
          console.error("❌ Authentication failed. Check your API key.");
          process.exit(1);
        }
        console.error(`Poll error: ${pollRes.status}`);
        await sleep(5000);
        continue;
      }

      const { task }: PollResponse = await pollRes.json();

      if (!task) {
        // No task available
        if (consecutive404 === 0) {
          process.stdout.write("⏳ Waiting for tasks");
        } else if (consecutive404 % 15 === 0) {
          process.stdout.write(".");
        }
        consecutive404++;
        await sleep(2000);
        continue;
      }

      // Reset counter
      if (consecutive404 > 0) {
        console.log(""); // newline after dots
        consecutive404 = 0;
      }

      console.log(`\n🔧 Task received: ${task.name} (${task.nodeType})`);
      console.log(`   Execution: ${task.executionId.slice(0, 8)}...`);
      console.log(`   Attempt: ${task.attempt}/${task.maxRetries + 1}`);

      // ── Execute ──
      const isClaudeNode = task.nodeType === "claude-task" || task.nodeType === "claude-review";

      let result;
      if (isClaudeNode) {
        result = await executeClaudeTask(
          task.prompt,
          task.upstreamOutputs,
          (stream, line) => {
            const prefix = stream === "stdout" ? "  │" : stream === "stderr" ? "  ⚠" : "  ℹ";
            console.log(`${prefix} ${line}`);
          }
        );
      } else {
        result = executeBuiltinNode(
          task.nodeType,
          task.prompt,
          task.upstreamOutputs
        );
        for (const log of result.logs) {
          console.log(`  ℹ ${log.content}`);
        }
      }

      // ── Submit result ──
      const status = result.success ? "completed" : "failed";
      console.log(`\n   ${result.success ? "✅" : "❌"} ${task.name}: ${status} (${(result.durationMs / 1000).toFixed(1)}s)`);

      const submitRes = await fetch(`${serverUrl}/api/workers/result`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stepExecutionId: task.stepExecutionId,
          status,
          output: result.output,
          error: result.error,
          logs: result.logs,
          durationMs: result.durationMs,
        }),
      });

      if (!submitRes.ok) {
        console.error(`   ⚠ Failed to submit result: ${submitRes.status}`);
      } else {
        const submitData = await submitRes.json();
        if (submitData.workflowStatus === "COMPLETED") {
          console.log("\n🎉 Workflow completed successfully!");
        } else if (submitData.workflowStatus === "FAILED") {
          console.log("\n💥 Workflow failed.");
        } else if (submitData.nodesReady > 0) {
          console.log(`   → ${submitData.nodesReady} node(s) ready to execute`);
        }
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`\n⚠ Error: ${msg}`);
      await sleep(5000);
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
