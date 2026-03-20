"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

type NodeState = "idle" | "running" | "done";

interface WorkflowNode {
  id: string;
  label: string;
  subtitle: string;
  x: number;
  y: number;
  color: string;
}

const nodes: WorkflowNode[] = [
  { id: "start", label: "Start", subtitle: "Trigger", x: 20, y: 110, color: "#22c55e" },
  { id: "write", label: "Write Code", subtitle: "Claude Agent", x: 190, y: 40, color: "#f97316" },
  { id: "test", label: "Run Tests", subtitle: "Claude Agent", x: 190, y: 180, color: "#f97316" },
  { id: "review", label: "AI Review", subtitle: "Quality Gate", x: 380, y: 110, color: "#8b5cf6" },
  { id: "deploy", label: "Deploy", subtitle: "Output", x: 550, y: 110, color: "#3b82f6" },
];

const edges: [string, string][] = [
  ["start", "write"],
  ["start", "test"],
  ["write", "review"],
  ["test", "review"],
  ["review", "deploy"],
];

function getCenter(id: string): { x: number; y: number } {
  const n = nodes.find((n) => n.id === id)!;
  return { x: n.x + 70, y: n.y + 30 };
}

export function AnimatedWorkflow() {
  const [states, setStates] = useState<Record<string, NodeState>>(() => ({
    start: "idle", write: "idle", test: "idle", review: "idle", deploy: "idle",
  }));

  useEffect(() => {
    const seq: { delay: number; s: Record<string, NodeState> }[] = [
      { delay: 600, s: { start: "running", write: "idle", test: "idle", review: "idle", deploy: "idle" } },
      { delay: 1200, s: { start: "done", write: "running", test: "running", review: "idle", deploy: "idle" } },
      { delay: 2800, s: { start: "done", write: "done", test: "running", review: "idle", deploy: "idle" } },
      { delay: 3600, s: { start: "done", write: "done", test: "done", review: "running", deploy: "idle" } },
      { delay: 5200, s: { start: "done", write: "done", test: "done", review: "done", deploy: "running" } },
      { delay: 6200, s: { start: "done", write: "done", test: "done", review: "done", deploy: "done" } },
      { delay: 8000, s: { start: "idle", write: "idle", test: "idle", review: "idle", deploy: "idle" } },
    ];

    let timeouts: ReturnType<typeof setTimeout>[] = [];
    function run() {
      timeouts = seq.map(({ delay, s }) => setTimeout(() => setStates(s), delay));
      timeouts.push(setTimeout(run, 9000));
    }
    run();
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-full" style={{ maxWidth: 700, height: 270, margin: "0 auto" }}>
      {/* Edges */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 270" fill="none">
        {edges.map(([from, to]) => {
          const a = getCenter(from);
          const b = getCenter(to);
          const fromDone = states[from] === "done";
          const midX = (a.x + b.x) / 2;

          return (
            <motion.path
              key={`${from}-${to}`}
              d={`M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`}
              stroke={fromDone ? "#f97316" : "#e5e5e5"}
              strokeWidth={fromDone ? 2.5 : 1.5}
              fill="none"
              strokeDasharray={fromDone ? "0" : "6 6"}
              animate={{
                stroke: fromDone ? "#f97316" : "#e5e5e5",
                strokeWidth: fromDone ? 2.5 : 1.5,
              }}
              transition={{ duration: 0.5 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const state = states[node.id];
        const isRunning = state === "running";
        const isDone = state === "done";

        return (
          <motion.div
            key={node.id}
            className="absolute"
            style={{ left: node.x, top: node.y, width: 140 }}
            animate={{ scale: isRunning ? 1.04 : 1, y: isRunning ? -2 : 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Glow */}
            {isRunning && (
              <motion.div
                className="absolute -inset-3 rounded-2xl"
                style={{ background: `radial-gradient(circle, ${node.color}18 0%, transparent 70%)` }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}

            <div
              className={`
                relative bg-white rounded-xl px-4 py-3.5 transition-all duration-400
                ${isRunning ? "shadow-xl" : isDone ? "shadow-md" : "shadow-sm"}
              `}
              style={{
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: isRunning ? node.color : isDone ? "#22c55e" : "#f0f0f0",
                boxShadow: isRunning
                  ? `0 8px 32px ${node.color}20, 0 2px 8px rgba(0,0,0,0.06)`
                  : isDone
                    ? "0 4px 16px rgba(34,197,94,0.08), 0 2px 6px rgba(0,0,0,0.04)"
                    : "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Status dot */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                  {node.subtitle}
                </span>
                <motion.div
                  className="w-2.5 h-2.5 rounded-full"
                  animate={{
                    backgroundColor: isRunning ? node.color : isDone ? "#22c55e" : "#d4d4d4",
                    scale: isRunning ? [1, 1.4, 1] : 1,
                  }}
                  transition={{
                    duration: isRunning ? 0.9 : 0.3,
                    repeat: isRunning ? Infinity : 0,
                  }}
                />
              </div>

              <p className="text-sm font-semibold text-neutral-800">{node.label}</p>

              {/* Status text */}
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-1.5"
                >
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: node.color }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                    <span className="text-[10px] font-mono text-neutral-400">executing...</span>
                  </div>
                </motion.div>
              )}
              {isDone && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-green-600 mt-1 font-medium"
                >
                  completed
                </motion.p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
