"use client";

import { useState } from "react";

export function EmailCapture({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setState(res.ok || res.status === 200 ? "success" : "error");
      setMessage(data.message || data.error);
      if (res.ok) setEmail("");
    } catch {
      setState("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="flex items-center gap-3 px-5 py-3.5 bg-green-50 border border-green-200 rounded-xl">
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-green-700 text-sm font-medium">{message}</span>
      </div>
    );
  }

  const isDark = variant === "dark";

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className={`flex gap-2 p-1.5 rounded-xl border ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200 shadow-lg shadow-neutral-200/50"}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className={`flex-1 px-4 py-3 rounded-lg text-sm focus:outline-none bg-transparent ${isDark ? "text-white placeholder:text-neutral-500" : "text-neutral-900 placeholder:text-neutral-400"}`}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 shrink-0"
        >
          {state === "loading" ? "Joining..." : "Get Early Access"}
        </button>
      </div>
      {state === "error" && (
        <p className="text-xs text-red-500 mt-2 ml-2">{message}</p>
      )}
    </form>
  );
}
