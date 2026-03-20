import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LogViewer } from "./log-viewer";

const statusColors: Record<string, string> = {
  QUEUED: "bg-neutral-100 text-neutral-700",
  RUNNING: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-neutral-100 text-neutral-400",
};

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const task = await db.task.findFirst({
    where: { id, userId },
    include: {
      logs: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!task) notFound();

  const duration =
    task.startedAt && task.completedAt
      ? `${((task.completedAt.getTime() - task.startedAt.getTime()) / 1000).toFixed(1)}s`
      : null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/tasks"
          className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          &larr; Back to Tasks
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{task.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary" className={statusColors[task.status]}>
              {task.status}
            </Badge>
            <span className="text-sm text-neutral-500">{task.agentType}</span>
            {duration && (
              <span className="text-sm text-neutral-500">{duration}</span>
            )}
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-500">
            Prompt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-700 whitespace-pre-wrap">
            {task.prompt}
          </p>
        </CardContent>
      </Card>

      {task.result && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500">
              Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono bg-neutral-50 p-4 rounded-lg overflow-auto max-h-96">
              {task.result}
            </pre>
          </CardContent>
        </Card>
      )}

      {task.errorMessage && (
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-red-600">
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-red-700 whitespace-pre-wrap font-mono">
              {task.errorMessage}
            </pre>
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />

      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Logs</h2>
        <LogViewer
          taskId={task.id}
          initialLogs={task.logs}
          isRunning={task.status === "RUNNING" || task.status === "QUEUED"}
        />
      </div>
    </div>
  );
}
