"use client";

import { useState } from "react";

export function EmailCapture({ className = "" }: { className?: string }) {
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
      <div className={`flex items-center gap-3 px-6 py-4 bg-green-500/10 border border-green-500/20 rounded-2xl ${className}`}>
        <span className="text-green-400 text-lg">✓</span>
        <span className="text-green-300 text-sm font-medium">{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        required
        className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="px-6 py-3.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-[0_0_24px_rgba(249,115,22,0.3)] disabled:opacity-50 shrink-0"
      >
        {state === "loading" ? "..." : "Get Early Access"}
      </button>
      {state === "error" && (
        <p className="absolute -bottom-6 left-0 text-xs text-red-400">{message}</p>
      )}
    </form>
  );
}
