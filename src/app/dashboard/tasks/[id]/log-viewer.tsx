"use client";

import { useEffect, useRef, useState } from "react";

interface Log {
  id: string;
  stream: string;
  content: string;
  timestamp: string | Date;
}

const streamColors: Record<string, string> = {
  STDOUT: "text-neutral-300",
  STDERR: "text-red-400",
  SYSTEM: "text-orange-400",
};

export function LogViewer({
  taskId,
  initialLogs,
  isRunning,
}: {
  taskId: string;
  initialLogs: Log[];
  isRunning: boolean;
}) {
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  // Poll for new logs when task is running
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tasks/${taskId}`);
        if (!res.ok) return;
        const data = await res.json();
        setLogs(data.logs);

        // Stop polling if task completed
        if (data.status !== "RUNNING" && data.status !== "QUEUED") {
          clearInterval(interval);
        }
      } catch {
        // Ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskId, isRunning]);

  if (logs.length === 0) {
    return (
      <div className="bg-neutral-900 rounded-lg p-6 text-center text-neutral-500 font-mono text-sm">
        {isRunning ? "Waiting for logs..." : "No logs available"}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-neutral-900 rounded-lg p-4 overflow-auto max-h-[500px] font-mono text-sm"
    >
      {logs.map((log) => (
        <div key={log.id} className="flex gap-3 py-0.5">
          <span className="text-neutral-600 text-xs shrink-0 w-20">
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
          <span className={`text-xs shrink-0 w-14 ${streamColors[log.stream] || "text-neutral-500"}`}>
            [{log.stream}]
          </span>
          <span className="text-neutral-200 whitespace-pre-wrap break-all">
            {log.content}
          </span>
        </div>
      ))}
      {isRunning && (
        <div className="flex items-center gap-2 mt-2 text-orange-400">
          <span className="animate-pulse">●</span>
          <span className="text-xs">Live</span>
        </div>
      )}
    </div>
  );
}
