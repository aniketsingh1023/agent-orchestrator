#!/usr/bin/env node

import { Command } from "commander";
import { saveConfig, getConfig, clearConfig } from "./config.js";
import { startWorker } from "./worker.js";

const program = new Command();

program
  .name("ctrlai")
  .description("CtrlAI CLI — Connect your machine to execute Claude Code workflow tasks")
  .version("0.1.0");

program
  .command("connect")
  .description("Connect this machine to a CtrlAI server")
  .argument("<server-url>", "Server URL (e.g., http://localhost:3001)")
  .argument("<api-key>", "Worker API key from the dashboard")
  .option("-n, --name <name>", "Worker name", `worker-${require("os").hostname()}`)
  .action(async (serverUrl: string, apiKey: string, opts: { name: string }) => {
    // Normalize URL
    const url = serverUrl.replace(/\/+$/, "");

    console.log(`\nConnecting to ${url}...`);

    // Verify connection
    try {
      const res = await fetch(`${url}/api/workers/poll`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (res.status === 401) {
        console.error("❌ Invalid API key.");
        process.exit(1);
      }

      if (!res.ok) {
        console.error(`❌ Server returned ${res.status}`);
        process.exit(1);
      }

      saveConfig({ serverUrl: url, apiKey, workerName: opts.name });
      console.log(`✅ Connected as "${opts.name}"`);
      console.log(`\nRun 'ctrlai start' to begin processing tasks.\n`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`❌ Cannot reach server: ${msg}`);
      process.exit(1);
    }
  });

program
  .command("start")
  .description("Start the worker — poll for and execute tasks")
  .action(async () => {
    await startWorker();
  });

program
  .command("status")
  .description("Show current connection status")
  .action(() => {
    const config = getConfig();
    if (!config?.apiKey) {
      console.log("\n⚠ Not connected. Run: ctrlai connect <server-url> <api-key>\n");
    } else {
      console.log(`\n✅ Connected`);
      console.log(`   Server: ${config.serverUrl}`);
      console.log(`   Worker: ${config.workerName}`);
      console.log(`   API Key: ${config.apiKey.slice(0, 12)}...`);
      console.log(`\nRun 'ctrlai start' to begin processing tasks.\n`);
    }
  });

program
  .command("disconnect")
  .description("Remove connection config")
  .action(() => {
    clearConfig();
    console.log("Disconnected.");
  });

program.parse();
