"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface StepExecution {
  id: string;
  status: string;
  attempt: number;
  maxRetries: number;
  startedAt: Date | string | null;
  completedAt: Date | string | null;
  errorMessage: string | null;
  step: { name: string };
}

interface Execution {
  id: string;
  status: string;
  startedAt: Date | string | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
  stepExecutions: StepExecution[];
}

export function ExecutionList({
  workflowId,
  executions,
  statusColors,
}: {
  workflowId: string;
  executions: Execution[];
  statusColors: Record<string, string>;
}) {
  if (executions.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400">
        No executions yet. Run the workflow to see results here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {executions.map((exec) => {
        const duration =
          exec.startedAt && exec.completedAt
            ? `${((new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000).toFixed(1)}s`
            : exec.startedAt
              ? "Running..."
              : "—";

        return (
          <Card key={exec.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={statusColors[exec.status] || ""}>
                    {exec.status}
                  </Badge>
                  <span className="text-xs text-neutral-400 font-mono">
                    {exec.id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span>{duration}</span>
                  <span>{new Date(exec.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Step execution progress */}
              <div className="flex gap-1">
                {exec.stepExecutions.map((se) => (
                  <div
                    key={se.id}
                    className="flex-1 group relative"
                    title={`${se.step.name}: ${se.status}${se.errorMessage ? ` — ${se.errorMessage}` : ""}`}
                  >
                    <div
                      className={`h-2 rounded-full ${
                        se.status === "COMPLETED"
                          ? "bg-green-500"
                          : se.status === "RUNNING"
                            ? "bg-orange-500 animate-pulse"
                            : se.status === "FAILED"
                              ? "bg-red-500"
                              : "bg-neutral-200"
                      }`}
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block truncate">
                      {se.step.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
