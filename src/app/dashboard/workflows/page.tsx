import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateWorkflowDialog } from "./create-workflow-dialog";

const statusColors: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-700",
  ACTIVE: "bg-green-100 text-green-700",
  ARCHIVED: "bg-neutral-100 text-neutral-400",
};

export default async function WorkflowsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const workflows = await db.workflow.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { steps: true, executions: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Workflows</h1>
          <p className="text-neutral-500 mt-1">Chain tasks into automated pipelines</p>
        </div>
        <CreateWorkflowDialog />
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-lg font-medium">No workflows yet</p>
          <p className="text-sm mt-1">Create a workflow to chain tasks together</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Executions</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((wf) => (
                <TableRow key={wf.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/workflows/${wf.id}`}
                      className="font-medium text-neutral-900 hover:text-orange-600 transition-colors"
                    >
                      {wf.name}
                    </Link>
                    {wf.description && (
                      <p className="text-xs text-neutral-400 mt-0.5">{wf.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[wf.status]}>
                      {wf.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-500">{wf._count.steps}</TableCell>
                  <TableCell className="text-neutral-500">{wf._count.executions}</TableCell>
                  <TableCell className="text-neutral-500">
                    {wf.createdAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
