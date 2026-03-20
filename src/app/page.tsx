"use client";

import { motion } from "framer-motion";
import { EmailCapture } from "@/components/landing/email-capture";
import { AnimatedWorkflow } from "@/components/landing/animated-workflow";
import { TerminalVisual } from "@/components/landing/terminal-visual";
import { LogoFull, LogoDark } from "@/components/logo";

function fade(delay = 0) {
  return { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.6 } };
}
function fadeView(delay = 0) {
  return { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay, duration: 0.6 } };
}

const features = [
  { title: "Real execution", desc: "Every node spawns Claude Code. Not a mock." },
  { title: "DAG workflows", desc: "Parallel branches with dependency resolution." },
  { title: "Context chaining", desc: "Output flows into the next step automatically." },
  { title: "Live streaming", desc: "Watch stdout flow through your pipeline." },
  { title: "Retry and recovery", desc: "Per-node retry with exponential backoff." },
  { title: "CLI worker", desc: "Runs on your machine. You own the execution." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] text-neutral-900 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.05),transparent_60%)] pointer-events-none" />
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, #ccc 0.7px, transparent 0.7px)",
        backgroundSize: "28px 28px",
      }} />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <LogoFull height={32} />
          <a
            href="#waitlist"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Join Waitlist
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">

            {/* Left */}
            <div>
              <motion.div {...fade(0)} className="mb-5">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200 text-[11px] text-neutral-500 font-medium shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  Private beta -- limited spots
                </span>
              </motion.div>

              <motion.h1 {...fade(0.08)} className="text-[3.5rem] md:text-[4.2rem] font-extrabold tracking-tight leading-[1.05]">
                Control
                <br />
                Claude Code
                <br />
                <span className="text-neutral-300 font-bold">like a system</span>
              </motion.h1>

              <motion.p {...fade(0.16)} className="text-base text-neutral-500 mt-5 max-w-[400px] leading-relaxed">
                Design agent workflows visually. Execute real tasks. Monitor everything.
              </motion.p>

              <motion.div {...fade(0.24)} className="mt-8 max-w-[440px]" id="waitlist">
                <EmailCapture variant="light" />
                <p className="text-[11px] text-neutral-400 mt-2.5 ml-1">Private beta. No spam.</p>
              </motion.div>
            </div>

            {/* Right — Canvas */}
            <motion.div {...fade(0.3)} className="relative">
              <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-100 bg-neutral-50/60">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-[11px] text-neutral-400 font-mono">deploy-pipeline.workflow</span>
                  </div>
                </div>
                <div className="p-5 bg-[#fcfcfc]">
                  <AnimatedWorkflow />
                </div>
              </div>
              <div className="absolute -inset-6 bg-gradient-to-br from-orange-500/[0.04] to-purple-500/[0.03] rounded-3xl blur-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION — Terminal vs CtrlAI ── */}
      <section className="py-28 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeView()} className="text-center mb-16">
            <h2 className="text-3xl md:text-[2.8rem] font-bold tracking-tight leading-tight">
              Stop managing agents
              <br />
              in terminals
            </h2>
            <p className="text-neutral-500 mt-3 max-w-md mx-auto text-sm">
              You have been building AI workflows with copy-paste and prayer.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left — Terminal (the old way) */}
            <motion.div {...fadeView(0.1)}>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 ml-1">The old way</p>
              <TerminalVisual />
            </motion.div>

            {/* Right — CtrlAI (the new way) */}
            <motion.div {...fadeView(0.2)}>
              <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-3 ml-1">With CtrlAI</p>
              <div className="bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/60">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono ml-2">CtrlAI -- workflow canvas</span>
                </div>
                <div className="p-4 space-y-3">
                  {/* Mini workflow steps */}
                  {[
                    { label: "Write Auth Module", status: "done" as const },
                    { label: "Write Tests", status: "done" as const },
                    { label: "AI Code Review", status: "running" as const },
                    { label: "Deploy to Staging", status: "pending" as const },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-100">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        step.status === "done" ? "bg-green-500" :
                        step.status === "running" ? "bg-orange-500 animate-pulse" :
                        "bg-neutral-300"
                      }`} />
                      <span className="text-sm font-medium text-neutral-800 flex-1">{step.label}</span>
                      <span className={`text-[10px] font-medium ${
                        step.status === "done" ? "text-green-600" :
                        step.status === "running" ? "text-orange-500" :
                        "text-neutral-400"
                      }`}>
                        {step.status === "done" ? "completed" : step.status === "running" ? "executing..." : "queued"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50/40">
                  <p className="text-[10px] text-neutral-400">Context chained automatically between steps</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-8 bg-white border-y border-neutral-100">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeView()} className="text-center mb-14">
            <h2 className="text-3xl md:text-[2.5rem] font-bold tracking-tight">Built for Claude Code</h2>
            <p className="text-neutral-500 mt-3 max-w-sm mx-auto text-sm">
              Every feature exists to orchestrate AI coding agents.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeView(i * 0.04)}
                className="flex gap-3.5 p-5 rounded-xl hover:bg-orange-50/40 border border-transparent hover:border-orange-100 transition-all duration-200 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-[7px] shrink-0 group-hover:shadow-[0_0_8px_rgba(249,115,22,0.5)] transition-shadow" />
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">{f.title}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EARLY ACCESS ── */}
      <section className="py-24 px-8">
        <motion.div {...fadeView()} className="max-w-lg mx-auto text-center">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] text-orange-600 font-medium mb-5">
            Early access
          </span>
          <h2 className="text-3xl font-bold tracking-tight">Free during private beta</h2>
          <p className="text-neutral-500 text-sm mt-2.5 mb-8">
            Full access before anyone else. No credit card.
          </p>
          <EmailCapture variant="light" />
        </motion.div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-8 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, #555 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }} />
        <motion.div {...fadeView()} className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            The future of AI development
            <br />
            <span className="text-neutral-500">is orchestrated</span>
          </h2>
          <p className="text-neutral-400 mt-4 text-sm">Get early access before public launch.</p>
          <div className="mt-8 max-w-md mx-auto">
            <EmailCapture variant="dark" />
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-neutral-100 py-6 px-8 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <LogoFull height={20} />
          <span className="text-xs text-neutral-400">Made with love by Aniket Singh</span>
          <a
            href="https://github.com/aniketsingh1023/agent-orchestrator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
