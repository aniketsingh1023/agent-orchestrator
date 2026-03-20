import { db } from "./db";

/**
 * Workflow Execution Engine
 *
 * Resolves the DAG and determines which steps are ready to run.
 * A step is "ready" when all its dependencies have completed successfully.
 */

export async function getReadySteps(executionId: string) {
  const execution = await db.workflowExecution.findUnique({
    where: { id: executionId },
    include: {
      stepExecutions: {
        include: {
          step: {
            include: {
              dependsOn: true,
            },
          },
        },
      },
    },
  });

  if (!execution) throw new Error(`Execution ${executionId} not found`);

  const readySteps: typeof execution.stepExecutions = [];

  for (const stepExec of execution.stepExecutions) {
    // Skip if already running, completed, or failed beyond retries
    if (stepExec.status !== "PENDING") continue;

    const dependencyStepIds = stepExec.step.dependsOn.map((d) => d.dependencyStepId);

    if (dependencyStepIds.length === 0) {
      // No dependencies — ready to run
      readySteps.push(stepExec);
      continue;
    }

    // Check if all dependencies are completed
    const depExecutions = execution.stepExecutions.filter((se) =>
      dependencyStepIds.includes(se.stepId)
    );

    const allDepsCompleted = depExecutions.every((de) => de.status === "COMPLETED");
    const anyDepFailed = depExecutions.some((de) => de.status === "FAILED");

    if (allDepsCompleted) {
      readySteps.push(stepExec);
    } else if (anyDepFailed) {
      // Dependency failed — mark this step as failed too
      await db.stepExecution.update({
        where: { id: stepExec.id },
        data: {
          status: "FAILED",
          errorMessage: "Dependency step failed",
          completedAt: new Date(),
        },
      });
    }
  }

  return readySteps;
}

export async function checkExecutionComplete(executionId: string) {
  const stepExecutions = await db.stepExecution.findMany({
    where: { executionId },
  });

  const allDone = stepExecutions.every(
    (se) => se.status === "COMPLETED" || se.status === "FAILED"
  );

  if (!allDone) return;

  const anyFailed = stepExecutions.some((se) => se.status === "FAILED");

  await db.workflowExecution.update({
    where: { id: executionId },
    data: {
      status: anyFailed ? "FAILED" : "COMPLETED",
      completedAt: new Date(),
    },
  });
}

export async function startWorkflowExecution(workflowId: string) {
  const workflow = await db.workflow.findUnique({
    where: { id: workflowId },
    include: { steps: true },
  });

  if (!workflow) throw new Error(`Workflow ${workflowId} not found`);
  if (workflow.steps.length === 0) throw new Error("Workflow has no steps");

  // Create execution + step executions
  const execution = await db.workflowExecution.create({
    data: {
      workflowId,
      status: "RUNNING",
      startedAt: new Date(),
      stepExecutions: {
        create: workflow.steps.map((step) => ({
          stepId: step.id,
          status: "PENDING",
          maxRetries: step.maxRetries,
          retryDelayMs: step.retryDelayMs,
        })),
      },
    },
    include: { stepExecutions: true },
  });

  return execution;
}
