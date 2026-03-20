"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const nodes = [
  { id: "start", label: "Start", icon: "▶", color: "#22c55e", x: 0, y: 50 },
  { id: "write", label: "Write Code", icon: "⚡", color: "#f97316", x: 220, y: 10 },
  { id: "test", label: "Run Tests", icon: "⚡", color: "#f97316", x: 220, y: 90 },
  { id: "review", label: "AI Review", icon: "🔍", color: "#8b5cf6", x: 440, y: 50 },
  { id: "output", label: "Deploy", icon: "⬤", color: "#ef4444", x: 620, y: 50 },
];

const edges = [
  { from: "start", to: "write" },
  { from: "start", to: "test" },
  { from: "write", to: "review" },
  { from: "test", to: "review" },
  { from: "review", to: "output" },
];

type NodeState = "idle" | "running" | "done";

export function AnimatedWorkflow() {
  const [states, setStates] = useState<Record<string, NodeState>>(() => ({
    start: "idle", write: "idle", test: "idle", review: "idle", output: "idle",
  }));

  useEffect(() => {
    const sequence = [
      { delay: 800, updates: { start: "running" } as Record<string, NodeState> },
      { delay: 1400, updates: { start: "done", write: "running", test: "running" } as Record<string, NodeState> },
      { delay: 3000, updates: { write: "done" } as Record<string, NodeState> },
      { delay: 3400, updates: { test: "done", review: "running" } as Record<string, NodeState> },
      { delay: 5000, updates: { review: "done", output: "running" } as Record<string, NodeState> },
      { delay: 5800, updates: { output: "done" } as Record<string, NodeState> },
      { delay: 7500, updates: { start: "idle", write: "idle", test: "idle", review: "idle", output: "idle" } as Record<string, NodeState> },
    ];

    let timeouts: ReturnType<typeof setTimeout>[] = [];

    function runSequence() {
      timeouts = sequence.map(({ delay, updates }) =>
        setTimeout(() => setStates((s) => ({ ...s, ...updates })), delay)
      );
      // Loop
      timeouts.push(setTimeout(runSequence, 8500));
    }

    runSequence();
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const getNodePos = (id: string) => nodes.find((n) => n.id === id)!;

  return (
    <div className="relative w-full max-w-[720px] h-[180px] mx-auto">
      {/* Edges */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 720 180">
        {edges.map((edge) => {
          const from = getNodePos(edge.from);
          const to = getNodePos(edge.to);
          const fromState = states[edge.from];
          const isActive = fromState === "done";

          return (
            <motion.line
              key={`${edge.from}-${edge.to}`}
              x1={from.x + 80}
              y1={from.y + 28}
              x2={to.x + 20}
              y2={to.y + 28}
              stroke={isActive ? "#f97316" : "#333"}
              strokeWidth={2}
              strokeDasharray={isActive ? "0" : "6 4"}
              animate={{
                stroke: isActive ? "#f97316" : "#333",
                opacity: isActive ? 1 : 0.3,
              }}
              transition={{ duration: 0.4 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const state = states[node.id];
        const borderColor =
          state === "running" ? node.color :
          state === "done" ? "#22c55e" :
          "#333";

        return (
          <motion.div
            key={node.id}
            className="absolute"
            style={{ left: node.x + 20, top: node.y }}
            animate={{
              scale: state === "running" ? 1.05 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative px-4 py-2.5 rounded-xl border-2 bg-neutral-900/80 backdrop-blur-sm min-w-[120px]"
              animate={{
                borderColor,
                boxShadow: state === "running"
                  ? `0 0 24px ${node.color}30`
                  : state === "done"
                    ? "0 0 16px rgba(34,197,94,0.15)"
                    : "0 0 0 transparent",
              }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">{node.icon}</span>
                <span className="text-xs font-medium text-white">{node.label}</span>
                <motion.div
                  className="w-2 h-2 rounded-full ml-auto"
                  animate={{
                    backgroundColor:
                      state === "running" ? node.color :
                      state === "done" ? "#22c55e" :
                      "#555",
                    scale: state === "running" ? [1, 1.3, 1] : 1,
                  }}
                  transition={{
                    duration: state === "running" ? 0.8 : 0.3,
                    repeat: state === "running" ? Infinity : 0,
                  }}
                />
              </div>
              {state === "running" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-neutral-500 mt-1 font-mono"
                >
                  executing...
                </motion.p>
              )}
              {state === "done" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-green-500/70 mt-1"
                >
                  ✓ done
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
