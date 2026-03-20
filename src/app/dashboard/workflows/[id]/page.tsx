import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddStepForm } from "./add-step-form";
import { RunWorkflowButton } from "./run-workflow-button";
import { ExecutionList } from "./execution-list";

const statusColors: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-700",
  ACTIVE: "bg-green-100 text-green-700",
  ARCHIVED: "bg-neutral-100 text-neutral-400",
  PENDING: "bg-neutral-100 text-neutral-700",
  RUNNING: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  const workflow = await db.workflow.findFirst({
    where: { id, userId: user.id },
    include: {
      steps: {
        include: {
          dependsOn: {
            include: { dependencyStep: { select: { id: true, name: true } } },
          },
        },
        orderBy: { positionY: "asc" },
      },
      executions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          stepExecutions: {
            include: { step: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!workflow) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/workflows"
          className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          &larr; Back to Workflows
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{workflow.name}</h1>
          {workflow.description && (
            <p className="text-neutral-500 mt-1">{workflow.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary" className={statusColors[workflow.status]}>
              {workflow.status}
            </Badge>
            <span className="text-sm text-neutral-500">
              {workflow.steps.length} step{workflow.steps.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        {workflow.steps.length > 0 && (
          <RunWorkflowButton workflowId={workflow.id} />
        )}
      </div>

      {/* Steps */}
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Steps</h2>
      {workflow.steps.length === 0 ? (
        <Card className="mb-6">
          <CardContent className="py-8 text-center text-neutral-400">
            No steps yet. Add your first step below.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 mb-6">
          {workflow.steps.map((step, idx) => (
            <Card key={step.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    <span className="text-orange-500 mr-2">#{idx + 1}</span>
                    {step.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span>{step.agentType}</span>
                    <span>·</span>
                    <span>{step.maxRetries} retries</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 whitespace-pre-wrap line-clamp-2">
                  {step.prompt}
                </p>
                {step.dependsOn.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
                    <span>Depends on:</span>
                    {step.dependsOn.map((dep) => (
                      <Badge key={dep.id} variant="secondary" className="text-xs">
                        {dep.dependencyStep.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddStepForm
        workflowId={workflow.id}
        existingSteps={workflow.steps.map((s) => ({ id: s.id, name: s.name }))}
      />

      <Separator className="my-8" />

      {/* Executions */}
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Executions</h2>
      <ExecutionList
        workflowId={workflow.id}
        executions={workflow.executions}
        statusColors={statusColors}
      />
    </div>
  );
}
