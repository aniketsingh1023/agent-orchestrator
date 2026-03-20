"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const lines = [
  { text: "$ claude --print 'Write auth module'", color: "#a3a3a3", delay: 0 },
  { text: "Running claude...", color: "#737373", delay: 0.3 },
  { text: "Error: context window exceeded", color: "#ef4444", delay: 1.2 },
  { text: "$ claude --print 'Fix the auth bug'", color: "#a3a3a3", delay: 2.0 },
  { text: "Running claude...", color: "#737373", delay: 2.3 },
  { text: "Done. Output saved to stdout", color: "#22c55e", delay: 3.5 },
  { text: "$ # now manually copy output...", color: "#525252", delay: 4.2 },
  { text: "$ # paste into next terminal...", color: "#525252", delay: 4.8 },
  { text: "$ # hope nothing breaks...", color: "#525252", delay: 5.4 },
  { text: "$ claude --print 'Now write tests for this'", color: "#a3a3a3", delay: 6.2 },
  { text: "Error: SIGTERM - process killed", color: "#ef4444", delay: 7.0 },
  { text: "$ # start over again...", color: "#ef4444", delay: 7.8 },
];

export function TerminalVisual() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    let idx = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function showNext() {
      if (idx >= lines.length) {
        // Reset after pause
        timeouts.push(setTimeout(() => {
          setVisibleLines(0);
          idx = 0;
          timeouts.push(setTimeout(showNext, 500));
        }, 2000));
        return;
      }

      const delay = idx === 0 ? 400 : (lines[idx].delay - lines[idx - 1].delay) * 1000;
      timeouts.push(setTimeout(() => {
        idx++;
        setVisibleLines(idx);
        showNext();
      }, delay));
    }

    showNext();
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-neutral-800 overflow-hidden shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#141414] border-b border-neutral-800">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[10px] text-neutral-600 font-mono ml-2">Terminal -- the old way</span>
      </div>

      {/* Terminal content */}
      <div className="p-4 font-mono text-xs leading-6 h-[240px] overflow-hidden">
        {lines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            style={{ color: line.color }}
          >
            {line.text}
          </motion.div>
        ))}
        {visibleLines < lines.length && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-neutral-500"
          >
            _
          </motion.span>
        )}
      </div>
    </div>
  );
}
