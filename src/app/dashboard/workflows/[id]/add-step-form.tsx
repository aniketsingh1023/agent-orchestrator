"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AddStepForm({
  workflowId,
  existingSteps,
}: {
  workflowId: string;
  existingSteps: Array<{ id: string; name: string }>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeps, setSelectedDeps] = useState<string[]>([]);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const prompt = formData.get("prompt") as string;
    const maxRetries = parseInt(formData.get("maxRetries") as string) || 3;

    try {
      const res = await fetch(`/api/workflows/${workflowId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          prompt,
          maxRetries,
          dependsOn: selectedDeps,
          positionY: existingSteps.length,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add step");
        return;
      }

      setSelectedDeps([]);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function toggleDep(stepId: string) {
    setSelectedDeps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-neutral-500">
          Add Step
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="step-name">Step Name</Label>
              <Input
                id="step-name"
                name="name"
                placeholder="e.g., Run tests"
                required
              />
            </div>
            <div>
              <Label htmlFor="maxRetries">Max Retries</Label>
              <Input
                id="maxRetries"
                name="maxRetries"
                type="number"
                min="0"
                max="10"
                defaultValue="3"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="step-prompt">Prompt</Label>
            <Textarea
              id="step-prompt"
              name="prompt"
              placeholder="What should the agent do in this step?"
              rows={3}
              required
            />
          </div>
          {existingSteps.length > 0 && (
            <div>
              <Label>Depends on (optional)</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {existingSteps.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => toggleDep(step.id)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      selectedDeps.includes(step.id)
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-orange-300"
                    }`}
                  >
                    {step.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Selected steps must complete before this step runs
              </p>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? "Adding..." : "Add Step"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
