"use client";

import { motion } from "framer-motion";
import { EmailCapture } from "@/components/landing/email-capture";
import { AnimatedWorkflow } from "@/components/landing/animated-workflow";
import { Logo } from "@/components/logo";

function fade(delay = 0) {
  return { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.7 } };
}
function fadeView(delay = 0) {
  return { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay, duration: 0.7 } };
}

const features = [
  { title: "Real execution", desc: "Every node spawns Claude Code. Not a mock. Not a simulation." },
  { title: "DAG workflows", desc: "Sequential chains and parallel branches with automatic dependency resolution." },
  { title: "Context chaining", desc: "Output from one step becomes the input for the next. Automatically." },
  { title: "Live streaming", desc: "Watch Claude think. Stdout streams through your pipeline in real-time." },
  { title: "Retry and recovery", desc: "Per-node retry with exponential backoff. Failures propagate cleanly." },
  { title: "CLI worker", desc: "Runs on your machine. Connects to the platform. You own the execution." },
];

const painPoints = [
  { title: "No visibility", desc: "You can't see what your agents are doing until they break something." },
  { title: "No orchestration", desc: "Separate terminals. Manual copy-paste. No dependency management." },
  { title: "No control", desc: "No retries. No context chaining. No execution history. Just hope." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.04),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.3] pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, #d4d4d4 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-neutral-200/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <span className="font-bold text-xl tracking-tight">CtrlAI</span>
          </div>
          <a
            href="#waitlist"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-lg"
          >
            Join Waitlist
          </a>
        </div>
      </nav>

      {/* ── HERO (split layout) ── */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — text + CTA */}
            <div>
              <motion.div {...fade(0)} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 shadow-sm text-xs text-neutral-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  Private beta -- limited spots
                </span>
              </motion.div>

              <motion.h1 {...fade(0.1)} className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.08]">
                Control
                <br />
                Claude Code
                <br />
                <span className="text-neutral-400">like a system</span>
              </motion.h1>

              <motion.p {...fade(0.2)} className="text-lg text-neutral-500 mt-6 max-w-md leading-relaxed">
                Design agent workflows visually. Execute real tasks. Monitor everything.
              </motion.p>

              <motion.div {...fade(0.3)} className="mt-8 max-w-md" id="waitlist">
                <EmailCapture variant="light" />
                <p className="text-xs text-neutral-400 mt-3">Private beta. No spam.</p>
              </motion.div>
            </div>

            {/* Right — animated canvas */}
            <motion.div {...fade(0.4)} className="relative">
              <div className="bg-white/60 backdrop-blur-sm border border-neutral-200/60 rounded-2xl shadow-xl shadow-neutral-200/40 p-6 pt-5">
                {/* Window chrome */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                  <div className="flex-1" />
                  <span className="text-[10px] text-neutral-400 font-mono">deploy-pipeline</span>
                </div>

                <AnimatedWorkflow />
              </div>

              {/* Floating accent shadow */}
              <div className="absolute -inset-4 bg-orange-500/5 rounded-3xl blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeView()} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Stop managing agents in terminals
            </h2>
            <p className="text-neutral-500 mt-3 max-w-md mx-auto">
              You have been building AI workflows with copy-paste and prayer. There is a better way.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {painPoints.map((p, i) => (
              <motion.div
                key={p.title}
                {...fadeView(i * 0.1)}
                className="bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                </div>
                <h3 className="font-semibold text-neutral-900">{p.title}</h3>
                <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 bg-white border-y border-neutral-200/60">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeView()} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for Claude Code</h2>
            <p className="text-neutral-500 mt-3 max-w-md mx-auto">
              Not another generic automation tool. Every feature orchestrates AI coding agents.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeView(i * 0.05)}
                className="flex gap-4 p-5 rounded-xl border border-neutral-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0 group-hover:shadow-[0_0_8px_rgba(249,115,22,0.4)] transition-shadow" />
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">{f.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EARLY ACCESS ── */}
      <section className="py-24 px-6">
        <motion.div {...fadeView()} className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-xs text-orange-600 font-medium mb-6">
            Early access
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Free during private beta</h2>
          <p className="text-neutral-500 text-sm mt-3 mb-8">
            Full access before anyone else. No credit card. No catch.
          </p>
          <EmailCapture variant="light" />
        </motion.div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6 bg-neutral-900 text-white">
        <motion.div {...fadeView()} className="max-w-2xl mx-auto text-center">
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
      <footer className="border-t border-neutral-200 py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="text-xs text-neutral-500 font-medium">CtrlAI</span>
          </div>
          <span className="text-xs text-neutral-400">Made with love by Aniket Singh</span>
          <a
            href="https://github.com/aniketsingh1023/agent-orchestrator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
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
