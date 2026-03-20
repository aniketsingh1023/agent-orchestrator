"use client";

import { motion } from "framer-motion";
import { EmailCapture } from "@/components/landing/email-capture";
import { AnimatedWorkflow } from "@/components/landing/animated-workflow";

function fade(delay = 0) {
  return { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.6 } };
}
function fadeView(delay = 0) {
  return { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay, duration: 0.6 } };
}

const painPoints = [
  { icon: "👁", title: "No visibility", desc: "You can't see what your agents are doing until they fail." },
  { icon: "🔗", title: "No orchestration", desc: "Running agents one at a time in separate terminals. Manually piping output." },
  { icon: "🎛", title: "No control", desc: "No retries. No context chaining. No execution history. Just hope." },
];

const features = [
  { title: "Real execution", desc: "Every node spawns Claude Code. Not a simulation." },
  { title: "DAG workflows", desc: "Sequential chains. Parallel branches. Automatic dependency resolution." },
  { title: "Context chaining", desc: "Output from node A becomes input for node B. Automatic." },
  { title: "Live streaming", desc: "Watch stdout flow through your pipeline in real-time." },
  { title: "Retry + recovery", desc: "Per-node retry with exponential backoff. Failures cascade cleanly." },
  { title: "CLI worker", desc: "Runs on your machine. Connects to the cloud. You own the execution." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.08),transparent_60%)] pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">C</span>
            </div>
            <span className="font-bold text-base tracking-tight">CtrlAI</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium ml-2">
              Private Beta
            </span>
          </div>
          <a href="#waitlist" className="text-sm text-neutral-400 hover:text-white transition-colors">
            Get Early Access →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fade(0)} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Private beta — limited spots
            </span>
          </motion.div>

          <motion.h1 {...fade(0.1)} className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Control Claude Code
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              like a system
            </span>
            <br />
            <span className="text-neutral-500">not a terminal</span>
          </motion.h1>

          <motion.p {...fade(0.2)} className="text-lg text-neutral-500 mt-6 max-w-lg mx-auto leading-relaxed">
            Visual workflows for AI coding agents.
            <br />
            Real execution. Context chaining. Live streaming.
          </motion.p>

          <motion.div {...fade(0.3)} className="mt-10 max-w-md mx-auto" id="waitlist">
            <EmailCapture />
            <p className="text-xs text-neutral-600 mt-3">No spam. We'll email you when it's your turn.</p>
          </motion.div>
        </div>
      </section>

      {/* ── ANIMATED WORKFLOW ── */}
      <section className="py-16 px-6">
        <motion.div {...fade(0.5)}>
          <div className="max-w-3xl mx-auto bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-sm">
            <AnimatedWorkflow />
          </div>
        </motion.div>
      </section>

      {/* ── PAIN ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeView()} className="text-3xl md:text-4xl font-bold text-center mb-4">
            Stop managing agents
            <br />
            <span className="text-neutral-500">in terminals</span>
          </motion.h2>
          <motion.p {...fadeView(0.1)} className="text-neutral-500 text-center mb-14 max-w-md mx-auto">
            You&apos;ve been building AI workflows with copy-paste and prayer. There&apos;s a better way.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6">
            {painPoints.map((p, i) => (
              <motion.div
                key={p.title}
                {...fadeView(i * 0.1)}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-orange-500/20 transition-colors"
              >
                <span className="text-2xl">{p.icon}</span>
                <h3 className="font-semibold text-white mt-3">{p.title}</h3>
                <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeView()} className="text-3xl md:text-4xl font-bold text-center mb-4">
            Built for Claude Code
          </motion.h2>
          <motion.p {...fadeView(0.1)} className="text-neutral-500 text-center mb-14 max-w-md mx-auto">
            Not another generic automation tool. Every feature exists to orchestrate AI coding agents.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeView(i * 0.05)}
                className="flex gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/15 transition-colors group"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0 group-hover:shadow-[0_0_8px_rgba(249,115,22,0.5)] transition-shadow" />
                <div>
                  <h3 className="font-semibold text-white text-sm">{f.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EARLY ACCESS ── */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto text-center">
          <motion.div {...fadeView()}>
            <p className="text-xs uppercase tracking-widest text-orange-500/60 font-semibold mb-4">Early access</p>
            <h2 className="text-3xl font-bold mb-2">Free during private beta</h2>
            <p className="text-neutral-500 text-sm mb-8">
              Get full access before anyone else. No credit card. No catch.
            </p>
            <EmailCapture />
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div {...fadeView()}>
            <h2 className="text-3xl md:text-4xl font-bold">
              The future of AI development
              <br />
              <span className="text-neutral-500">is orchestrated</span>
            </h2>
            <p className="text-neutral-500 mt-4 text-sm">
              Get early access before public launch.
            </p>
            <div className="mt-8 max-w-md mx-auto">
              <EmailCapture />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-[7px]">C</span>
            </div>
            <span>CtrlAI</span>
          </div>
          <span>© 2026 CtrlAI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
