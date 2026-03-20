import { Queue } from "bullmq";

export const taskQueue = new Queue("task-execution", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    maxRetriesPerRequest: null,
  },
});
