"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

function fadeUp(delay: number = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5 },
  };
}

function fadeUpView(delay: number = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { delay, duration: 0.5 },
  };
}

const features = [
  {
    icon: "⚡",
    title: "Claude Code Execution",
    description: "Each node triggers a real Claude Code task. Not mock. Not simulation. Real execution.",
  },
  {
    icon: "🔗",
    title: "Context Chaining",
    description: "Output from one node flows into the next as context. Claude sees what previous steps produced.",
  },
  {
    icon: "🔄",
    title: "Auto Retry + Recovery",
    description: "Failed nodes retry with exponential backoff. Configure per-node retry policy.",
  },
  {
    icon: "📡",
    title: "Real-Time Streaming",
    description: "Watch Claude think. Live stdout streaming via WebSocket as each node executes.",
  },
  {
    icon: "🔍",
    title: "AI Review Gates",
    description: "Claude reviews its own output. Quality gates that pass or fail based on AI judgment.",
  },
  {
    icon: "⚙️",
    title: "DAG Execution Engine",
    description: "Parallel branches, sequential chains. Your workflow graph becomes an execution plan.",
  },
];

const steps = [
  { num: "01", title: "Design your workflow", desc: "Drag Claude Task nodes onto the canvas. Connect them." },
  { num: "02", title: "Write prompts", desc: "Each node gets a prompt. Previous outputs chain automatically." },
  { num: "03", title: "Hit Execute", desc: "Watch nodes light up in real-time as Claude works through your pipeline." },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: ["50 executions/month", "1 concurrent workflow", "24h log retention", "Community support"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    features: ["1,000 executions/month", "5 concurrent workflows", "30-day log retention", "Priority queue", "Email support"],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    features: ["5,000 executions/month", "20 concurrent workflows", "90-day log retention", "Team collaboration", "Priority support"],
    cta: "Contact Us",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="font-bold text-lg tracking-tight">CtrlAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Sign In</Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 px-4">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp(0)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Now in Public Beta
          </motion.div>

          <motion.h1 {...fadeUp(0.1)}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Control Claude Code
            <br />
            <span className="text-orange-500">with workflows</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)}
            className="text-lg text-neutral-500 mt-6 max-w-xl mx-auto leading-relaxed">
            Build visual pipelines that orchestrate Claude Code agents. Each node executes real AI tasks — with context chaining, retries, and live streaming.
          </motion.p>

          <motion.div {...fadeUp(0.3)}
            className="flex gap-4 justify-center mt-10">
            <Link href="/sign-up">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-sm h-12 rounded-xl">
                Start Building Free →
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" className="px-8 py-3 text-sm h-12 rounded-xl">
                See How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Mock canvas visual */}
          <motion.div {...fadeUp(0.4)}
            className="mt-16 relative">
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 shadow-2xl p-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-8 justify-center">
                {/* Start node */}
                <div className="bg-white rounded-xl border-2 border-green-300 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">▶</span>
                    <span className="text-xs font-semibold">Start</span>
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>

                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                  className="text-orange-400 text-xl">→</motion.div>

                {/* Claude task node */}
                <div className="bg-white rounded-xl border-2 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.15)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>⚡</span>
                    <span className="text-xs font-semibold">Write Tests</span>
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1 font-mono">executing...</p>
                </div>

                <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="text-neutral-300 text-xl">→</motion.div>

                {/* Pending node */}
                <div className="bg-white rounded-xl border-2 border-neutral-200 px-4 py-3 shadow-sm opacity-50">
                  <div className="flex items-center gap-2">
                    <span>🔍</span>
                    <span className="text-xs font-semibold">Review</span>
                    <span className="w-2 h-2 rounded-full bg-neutral-300" />
                  </div>
                </div>

                <div className="text-neutral-200 text-xl">→</div>

                <div className="bg-white rounded-xl border-2 border-neutral-200 px-4 py-3 shadow-sm opacity-40">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">⬤</span>
                    <span className="text-xs font-semibold">Output</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Built for Claude Code</h2>
          <p className="text-neutral-500 text-center mb-12 max-w-lg mx-auto">Not another generic automation tool. Every feature is designed around orchestrating AI coding agents.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUpView(i * 0.1)}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-md transition-shadow">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="font-semibold mt-3 text-sm">{f.title}</h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.num} {...fadeUpView(i * 0.1)}>
                <span className="text-4xl font-bold text-orange-500/20">{s.num}</span>
                <h3 className="font-semibold mt-2">{s.title}</h3>
                <p className="text-sm text-neutral-500 mt-1">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-neutral-500 text-center mb-12">Start free. Scale when you need to.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((p) => (
              <div key={p.name}
                className={`rounded-2xl border p-6 ${p.highlight ? "border-orange-400 bg-white shadow-lg ring-1 ring-orange-400/20" : "border-neutral-200 bg-white"}`}>
                <h3 className="font-semibold">{p.name}</h3>
                <div className="mt-3">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-neutral-400 text-sm">{p.period}</span>
                </div>
                <ul className="mt-6 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-neutral-600">
                      <span className="text-orange-500 text-xs">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  <Button className={`w-full mt-6 ${p.highlight ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                    variant={p.highlight ? "default" : "outline"}>
                    {p.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Stop managing agents in terminals</h2>
          <p className="text-neutral-500 mt-4">Build visual Claude Code pipelines. Ship faster.</p>
          <Link href="/sign-up">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-sm h-12 rounded-xl mt-8">
              Get Started Free →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">C</span>
            </div>
            <span>CtrlAI</span>
          </div>
          <span>© 2026 CtrlAI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
