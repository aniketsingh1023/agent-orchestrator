import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="text-center max-w-2xl px-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-8">
          <span className="text-white font-bold text-2xl">AO</span>
        </div>
        <h1 className="text-5xl font-bold text-neutral-900 tracking-tight">
          Agent Orchestrator
        </h1>
        <p className="text-lg text-neutral-500 mt-4 max-w-md mx-auto">
          Manage, run, and monitor AI agents from a clean dashboard.
          Replace terminal chaos with orchestrated workflows.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/sign-up">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-base">
              Get Started Free
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" className="px-8 py-3 text-base">
              Sign In
            </Button>
          </Link>
        </div>
        <p className="text-xs text-neutral-400 mt-6">
          50 free tasks/month. No credit card required.
        </p>
      </div>
    </div>
  );
}
