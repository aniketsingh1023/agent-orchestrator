import "dotenv/config";
import { Worker, Job } from "bullmq";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ClaudeCodeProvider } from "../lib/agents/claude-code";
import type { AgentProvider } from "../lib/agents/provider";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
};

const agents: Record<string, AgentProvider> = {
  "claude-code": new ClaudeCodeProvider(),
};

interface TaskJobData {
  taskId: string;
  prompt: string;
  agentType: string;
}

const worker = new Worker<TaskJobData>(
  "task-execution",
  async (job: Job<TaskJobData>) => {
    const { taskId, prompt, agentType } = job.data;

    const agent = agents[agentType];
    if (!agent) {
      await db.task.update({
        where: { id: taskId },
        data: { status: "FAILED", errorMessage: `Unknown agent type: ${agentType}` },
      });
      return;
    }

    // Mark as running
    await db.task.update({
      where: { id: taskId },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    const onLog = async (stream: "stdout" | "stderr" | "system", content: string) => {
      const streamMap = { stdout: "STDOUT", stderr: "STDERR", system: "SYSTEM" } as const;
      await db.taskLog.create({
        data: {
          taskId,
          stream: streamMap[stream],
          content,
        },
      });
    };

    const result = await agent.execute(prompt, onLog);

    await db.task.update({
      where: { id: taskId },
      data: {
        status: result.success ? "COMPLETED" : "FAILED",
        result: result.output || null,
        errorMessage: result.error || null,
        completedAt: new Date(),
      },
    });
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[worker] Task ${job.data.taskId} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Task ${job?.data.taskId} failed:`, err.message);
});

console.log("[worker] Task execution worker started");
