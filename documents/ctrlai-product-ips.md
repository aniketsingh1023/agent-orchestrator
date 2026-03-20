# CtrlAI — Product IP Document

## Confidential — For Internal Use, Marketing, and Investor Communications

---

## 1. What Is CtrlAI

CtrlAI is a visual orchestration platform for AI coding agents. It replaces the chaotic terminal-based workflow of running Claude Code (and other AI agents) with a structured, visual, execution-aware system.

Think of it as **n8n, but built specifically for AI coding agents**.

### One-Liner
**Control Claude Code with workflows — not terminals.**

### Elevator Pitch (30 seconds)
Developers today run AI coding agents in terminals — one at a time, with no visibility, no orchestration, and no error recovery. CtrlAI changes that. It gives you a visual canvas to design agent workflows, a CLI that executes them on your machine, and a real-time dashboard that shows exactly what your agents are doing. Every node in the workflow is a real Claude Code execution — with context chaining, automatic retries, and live stdout streaming.

---

## 2. The Problem We Solve

### Current State (Pain)
- Developers run Claude Code in separate terminal windows
- Output from one task must be manually copied into the next
- No retry logic — if a task fails, you start over
- No visibility into what the agent is doing until it finishes (or breaks)
- No way to run parallel tasks with dependency management
- No execution history, no logs, no audit trail
- Scaling from 1 agent to 5 agents is pure chaos

### Who Feels This Pain
- Solo developers using Claude Code daily
- Engineering teams integrating AI agents into their workflow
- DevOps teams wanting to automate AI-assisted code generation
- Agencies running AI coding pipelines for multiple clients

### Pain Severity
This is a daily friction point for anyone using AI coding agents seriously. The gap between "AI can write code" and "AI can reliably execute multi-step coding workflows" is massive. CtrlAI fills that gap.

---

## 3. What CtrlAI Does

### Core Product

**Visual Workflow Canvas**
- Drag-and-drop node editor (React Flow)
- Claude Task nodes, Review gates, Merge nodes, Output collectors
- Connect nodes to define execution order and data flow
- Save, load, and version workflows

**Execution Engine**
- Converts workflow graph into a DAG (Directed Acyclic Graph)
- Resolves dependencies — parallel branches run simultaneously
- Sequential chains execute in order
- Each node becomes a real job that spawns Claude Code

**Claude Code Runtime**
- CLI tool (`ctrlai-cli`) runs on the developer's machine
- Connects to CtrlAI backend, polls for tasks
- Spawns `claude` CLI with the prompt + upstream context
- Streams stdout/stderr back to the platform in real-time
- Reports completion/failure, triggering the next node

**Context Chaining**
- Output from Node A automatically becomes input context for Node B
- No manual copy-paste — the platform injects upstream outputs into prompts
- Example: "Write auth module" output feeds into "Write tests for this code"

**Retry and Recovery**
- Per-node configurable retry count and delay
- Exponential backoff on failures
- Cascade failure propagation (downstream nodes auto-fail if upstream fails)

**Real-Time Monitoring**
- Node states update live: idle, queued, running, success, error
- Stdout streams through the pipeline as it happens
- Execution history with full logs per node

---

## 4. How It Works (User Flow)

```
1. User opens CtrlAI canvas
2. Drags nodes: Start → Write Code → Write Tests → Review → Deploy
3. Configures each node with a prompt
4. Clicks "Execute"
5. Backend creates execution plan (DAG)
6. CLI worker picks up the first node (Start)
7. Start completes → Write Code and Write Tests run in parallel
8. Both complete → Review runs (sees both outputs as context)
9. Review passes → Deploy runs
10. User watches the entire pipeline execute in real-time on the canvas
```

---

## 5. Competitive Landscape

| Product | What It Does | Why CtrlAI Is Different |
|---------|-------------|----------------------|
| n8n | Generic workflow automation | Not built for AI agents. No Claude integration. No execution awareness. |
| Zapier | SaaS-to-SaaS connectors | No code execution. No agent orchestration. |
| LangChain | LLM chaining library | Code-only, no visual builder, no execution monitoring. |
| CrewAI | Multi-agent framework | Python-only, no visual canvas, no real-time monitoring. |
| Cursor / Windsurf | AI code editors | Single-task execution, no workflow orchestration. |

### CtrlAI Moat
- **Only visual orchestrator built specifically for Claude Code**
- **Context chaining** is automatic, not manual
- **CLI-based execution** means the developer owns their compute
- **Real-time streaming** from agent to dashboard
- **DAG execution engine** handles complex multi-step pipelines

---

## 6. Business Model

### Pricing Tiers

| Tier | Price | Target | Limits |
|------|-------|--------|--------|
| Free | $0/mo | Individual devs trying it out | 50 executions/mo, 1 concurrent workflow |
| Pro | $19/mo | Power users, freelancers | 1,000 executions/mo, 5 concurrent workflows, 30-day logs |
| Team | $49/mo | Engineering teams | 5,000 executions/mo, 20 concurrent, team collaboration |
| Enterprise | Custom | Large orgs | Unlimited, SSO, audit logs, dedicated support |

### Revenue Drivers
- Execution count (per-node, not per-workflow — a 5-node workflow = 5 executions)
- Concurrency (free users wait in queue, paid users run parallel)
- Log retention (free = 24h, pro = 30d, team = 90d)
- Team features (collaboration, shared workflows, role-based access)

### Unit Economics
- Infrastructure cost per execution: near-zero (CLI runs on user's machine)
- Main costs: Supabase (DB), Vercel (hosting), Clerk (auth)
- Estimated gross margin: 85-90%

---

## 7. Go-To-Market Strategy

### Phase 1: Private Beta (Current)
- Landing page with email waitlist
- Target: Claude Code power users on Twitter/X
- Goal: 500 waitlist signups, 50 active beta users
- Channel: Developer Twitter, Claude Code community, Hacker News

### Phase 2: Public Launch
- Product Hunt launch
- Open beta with free tier
- Content marketing: "How I orchestrate 5 Claude agents simultaneously"
- YouTube demos showing workflow execution

### Phase 3: Growth
- Integrations with other AI agents (OpenAI Codex, Devin, etc.)
- Marketplace for workflow templates
- Team/enterprise features
- API for programmatic workflow creation

---

## 8. Marketing Campaign Ideas

### Campaign 1: "Terminal Chaos" (Awareness)
**Concept:** Show the painful reality of managing AI agents in terminals.
**Format:** Short video (30s) / carousel post
**Hook:** "This is how most developers run AI agents" [messy terminal] → "This is how it should work" [clean CtrlAI canvas]
**CTA:** Join the waitlist
**Channels:** Twitter/X, LinkedIn, Reddit (r/programming, r/ClaudeAI)

### Campaign 2: "Watch Claude Work" (Product Demo)
**Concept:** Screen recording of a real workflow executing — nodes lighting up, stdout streaming.
**Format:** 60s video
**Hook:** "I just ran 5 Claude agents in parallel with zero copy-paste"
**CTA:** Get early access
**Channels:** Twitter/X, YouTube Shorts, Product Hunt teaser

### Campaign 3: "Before/After" (Pain → Solution)
**Concept:** Split screen — left shows terminal chaos, right shows CtrlAI canvas.
**Format:** Static image or short GIF
**Copy:**
  - Before: 4 terminals, manual copy-paste, errors everywhere
  - After: 1 canvas, automated context chaining, live monitoring
**CTA:** Stop managing agents in terminals
**Channels:** Twitter/X ads, developer newsletters

### Campaign 4: "Built in Public" (Trust Building)
**Concept:** Share the building journey — GitHub heatmap, daily progress, honest updates.
**Format:** Thread / blog post series
**Hook:** "I'm building the n8n for AI agents — here's week 1"
**CTA:** Follow the journey, join the beta
**Channels:** Twitter/X, dev.to, Hashnode

### Campaign 5: "The 10x Pipeline" (Aspiration)
**Concept:** Show a complex workflow that would take hours manually, running in minutes.
**Format:** Long-form video (3-5 min)
**Example workflow:**
  - Write auth module → Write tests → Run tests → Fix failures → Code review → Deploy
  - All automated, all with context chaining
**CTA:** Build your first pipeline in 5 minutes
**Channels:** YouTube, Twitter/X, LinkedIn

### Campaign 6: "Developer Testimonial" (Social Proof)
**Concept:** Early beta users share their experience.
**Format:** Quote cards, short video clips
**Key messages:**
  - "I went from 4 terminals to 1 canvas"
  - "Context chaining alone saved me hours"
  - "I can finally see what my agents are doing"
**Channels:** Twitter/X, landing page

---

## 9. Ad Copy Templates

### Twitter/X Ad (Short)
> Stop copy-pasting between Claude terminals.
>
> CtrlAI lets you design visual workflows for Claude Code — with context chaining, parallel execution, and live streaming.
>
> Private beta is free. Join the waitlist.
> [link]

### LinkedIn Ad (Professional)
> If your team is using AI coding agents, you need orchestration.
>
> CtrlAI is a visual workflow platform built specifically for Claude Code. Design pipelines, chain context between steps, run agents in parallel, and monitor everything in real-time.
>
> We are in private beta. Early access is free.
> [link]

### Reddit Post (Community)
> Title: I built a visual orchestrator for Claude Code — open to beta testers
>
> I was tired of managing Claude Code in separate terminals, manually piping output between tasks. So I built CtrlAI — a visual canvas where you design workflows, and a CLI that executes them on your machine.
>
> Each node runs real Claude Code. Output from one step automatically becomes context for the next. Failed steps retry with backoff. You watch the whole thing execute in real-time.
>
> Private beta is free. Looking for feedback from developers who use Claude Code daily.
> [link]

### Newsletter Feature Pitch
> Subject: CtrlAI — n8n for AI coding agents
>
> CtrlAI is a visual workflow platform for Claude Code. Instead of running agents in terminals, you design execution pipelines on a canvas. Each node spawns a real Claude Code task with automatic context chaining. The CLI runs on your machine — you own the execution.
>
> Currently in private beta. Free for early users.

---

## 10. Key Metrics to Track

| Metric | Target (3 months) |
|--------|-------------------|
| Waitlist signups | 1,000 |
| Beta users | 100 |
| Weekly active users | 50 |
| Workflows created | 500 |
| Total executions | 10,000 |
| Paid conversions | 20 (Pro tier) |
| MRR | $380 |

---

## 11. Technical Architecture Summary

```
User's Browser (Canvas)
    ↕ REST API + Polling
CtrlAI Backend (Next.js + Prisma + Supabase)
    ↕ Task Queue (Poll-based)
ctrlai-cli (User's Machine)
    ↕ Spawns
Claude Code CLI
```

- Frontend: Next.js, React Flow, Zustand, Tailwind, ShadCN
- Backend: Next.js API routes, Prisma ORM, PostgreSQL (Supabase)
- Auth: Clerk (free tier, 10K MAU)
- CLI: Node.js, Commander.js
- Hosting: Vercel (frontend), user's machine (execution)

---

## 12. Intellectual Property

### What We Own
- CtrlAI brand name and logo
- Visual workflow canvas implementation
- Claude Code Runtime Controller (execution lifecycle management)
- Context chaining algorithm (upstream output injection)
- DAG execution engine with poll-based worker assignment
- ctrlai-cli tool
- All frontend/backend source code

### Defensibility
- Deep Claude Code integration (first-mover)
- Workflow template marketplace (network effect)
- Execution data (usage patterns, workflow templates)
- Brand recognition in AI developer tooling space

---

*Document created: March 2026*
*Author: Aniket Singh*
*Status: Internal — Do Not Distribute Publicly*
