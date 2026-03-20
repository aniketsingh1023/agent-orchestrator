"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { EmailCapture } from "@/components/landing/email-capture";
import { AnimatedWorkflow } from "@/components/landing/animated-workflow";
import { LogoFull } from "@/components/logo";

function fade(delay = 0) {
  return { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.6 } };
}

// Generate fake GitHub contribution data
function generateContributions(): number[][] {
  const weeks: number[][] = [];
  for (let w = 0; w < 52; w++) {
    const days: number[] = [];
    for (let d = 0; d < 7; d++) {
      // More active in recent weeks
      const recency = w / 52;
      const rand = Math.random();
      if (rand < 0.15 + recency * 0.3) days.push(0);
      else if (rand < 0.4) days.push(1);
      else if (rand < 0.65) days.push(2);
      else if (rand < 0.85) days.push(3);
      else days.push(4);
    }
    weeks.push(days);
  }
  return weeks;
}

const contributions = generateContributions();
const intensityColors = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  // Smooth transition: hero fades slightly as dark section comes in
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.6]);
  const darkY = useTransform(scrollYProgress, [0.1, 0.35], [80, 0]);
  const darkOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f8f8f8] text-neutral-900 overflow-hidden">
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
          <a href="#waitlist" className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5">
            Join Waitlist
          </a>
        </div>
      </nav>

      {/* ═══════════ SECTION 1: HERO ═══════════ */}
      <motion.section style={{ opacity: heroOpacity }} className="relative pt-36 pb-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
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

        {/* Scroll transition gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-neutral-950 pointer-events-none" />
      </motion.section>

      {/* ═══════════ SECTION 2: BUILT BY — GitHub heatmap ═══════════ */}
      <motion.section
        style={{ y: darkY, opacity: darkOpacity }}
        className="relative bg-neutral-950 text-white py-32 px-8 overflow-hidden"
      >
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-500/[0.05] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[11px] font-semibold text-green-400 uppercase tracking-widest mb-5">The builder</span>
            <h2 className="text-4xl md:text-[3.5rem] font-bold tracking-tight leading-[1.08]">
              Built by a crazy
              <br />
              <span className="text-neutral-500">developer</span>
            </h2>
            <p className="text-neutral-400 mt-4 max-w-md mx-auto text-sm leading-relaxed">
              One person. Obsessed with AI agents. Shipping every single day.
            </p>
          </motion.div>

          {/* GitHub Contribution Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">A</div>
                <div>
                  <p className="text-sm font-semibold text-white">Aniket Singh</p>
                  <p className="text-xs text-neutral-500">@aniketsingh1023</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">1,247</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">contributions this year</p>
              </div>
            </div>

            {/* Heatmap grid */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-[3px] min-w-[700px]">
                {contributions.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((level, di) => (
                      <motion.div
                        key={`${wi}-${di}`}
                        className="w-[11px] h-[11px] rounded-[2px]"
                        style={{ backgroundColor: intensityColors[level] }}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: wi * 0.008 + di * 0.002, duration: 0.2 }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-[10px] text-neutral-600">Shipping CtrlAI every day</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-neutral-600">Less</span>
                {intensityColors.map((color, i) => (
                  <div key={i} className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: color }} />
                ))}
                <span className="text-[10px] text-neutral-600">More</span>
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-4 gap-4 mt-6"
          >
            {[
              { value: "87", label: "Days straight" },
              { value: "342", label: "Commits" },
              { value: "12K+", label: "Lines of code" },
              { value: "1", label: "Crazy dev" },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Transition to section 3 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#f8f8f8] pointer-events-none" />
      </motion.section>

      {/* ═══════════ SECTION 3: CTA — Get Early Access ═══════════ */}
      <section className="relative py-32 px-8 bg-[#f8f8f8]">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] text-orange-600 font-medium mb-6">
              Early access is free
            </span>
            <h2 className="text-3xl md:text-[2.8rem] font-bold tracking-tight leading-tight">
              Get in before
              <br />
              everyone else
            </h2>
            <p className="text-neutral-500 text-sm mt-3 mb-10">
              No credit card. No catch. Just early access.
            </p>
            <EmailCapture variant="light" />
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-neutral-200 py-6 px-8 bg-white">
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
