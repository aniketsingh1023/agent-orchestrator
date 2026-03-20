import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateTaskDialog } from "./create-task-dialog";

const statusColors: Record<string, string> = {
  QUEUED: "bg-neutral-100 text-neutral-700",
  RUNNING: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-neutral-100 text-neutral-400",
};

export default async function TasksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tasks = await db.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Tasks</h1>
          <p className="text-neutral-500 mt-1">Create and monitor agent tasks</p>
        </div>
        <CreateTaskDialog />
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-lg font-medium">No tasks yet</p>
          <p className="text-sm mt-1">Create your first task to get started</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const duration =
                  task.startedAt && task.completedAt
                    ? `${((task.completedAt.getTime() - task.startedAt.getTime()) / 1000).toFixed(1)}s`
                    : task.startedAt
                      ? "Running..."
                      : "—";

                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/tasks/${task.id}`}
                        className="font-medium text-neutral-900 hover:text-orange-600 transition-colors"
                      >
                        {task.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[task.status]}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-500">{task.agentType}</TableCell>
                    <TableCell className="text-neutral-500">
                      {task.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-neutral-500">{duration}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
