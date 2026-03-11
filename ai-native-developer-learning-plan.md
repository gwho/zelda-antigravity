# AI-Native Developer Learning Plan
## From "Generate → Comprehend → Re-implement" to Human-Model Co-Working

> **What this document is:** A complete strategy for learning game development (and TypeScript, and software architecture) by combining traditional deep-understanding methods with modern agentic coding tools. It is designed to be read by both Jesse and by Claude Code — drop it into your project root as `LEARNING-STRATEGY.md` and reference it from `CLAUDE.md` so every agent session respects these learning principles.

---

## Part 1 — The G→C→R Framework (Formalized)

The Generate → Comprehend → Re-implement cycle is the backbone of everything in this plan. Here is the precise definition so that every prompt and every tool integration below can reference it consistently.

**Generate** means using a coding agent (Claude Code, Cursor, or Claude chat) to produce working code for a well-defined specification. The human writes the spec, the agent writes the code. The human does not read the code during this phase — the goal is a working artifact, not understanding.

**Comprehend** means studying the generated code without modifying it. The human reads every line, traces execution paths, annotates intent, identifies patterns, and surfaces questions. This phase uses pencil-and-paper tracing, annotation files, and "explain this to me" prompts directed at a teaching agent. The human does not write new code during this phase — the goal is a mental model, not output.

**Re-implement** means closing the generated code and rebuilding the same functionality from scratch, using only the mental model built during Comprehend. The human may reference the generated code when stuck (it is a textbook, not a forbidden text), but every line must be typed from understanding, not copied. The goal is ownership — when this phase is complete, the human can explain every decision in the code because they made each decision themselves.

### The Critical Rule

Each phase must be completed before the next one begins. Skipping Comprehend and jumping from Generate straight to extending the code produces a developer who can follow patterns but cannot debug novel problems. Skipping Re-implement and stopping at Comprehend produces a developer who can explain code but cannot write it under pressure. The full cycle is what builds an AI-native developer who can both direct agents effectively and work independently when needed.

---

## Part 2 — Modern Tool Integration Map

The agentic coding ecosystem has evolved rapidly. Below is a curated map of the tools that are directly relevant to the G→C→R learning workflow, organized by which phase they serve. Each tool includes a one-paragraph explanation, practical usage guidance, and a keyword for deeper research.

### 2A — CLAUDE.md (Project Memory)

CLAUDE.md is a markdown file at your project root that Claude Code reads automatically at the start of every session. It acts as persistent project memory — architecture decisions, coding conventions, file structure, and (critically for our purposes) learning constraints. By embedding your G→C→R rules directly in CLAUDE.md, every agent session will respect your learning methodology without you having to re-explain it each time.

**How to use it for learning:** Add a `## Learning Mode` section to your CLAUDE.md that tells Claude Code which G→C→R phase you are currently in and what constraints to follow. When you are in Comprehend phase, the agent should explain code but not write new code. When you are in Re-implement phase, the agent should only answer conceptual questions, never produce implementation code. Change this section as you progress through each feature. CLAUDE.md files can also exist in subdirectories for module-specific context, and there is a global `~/.claude/CLAUDE.md` for personal preferences that apply across all projects.

**Lookup keywords:** `CLAUDE.md hierarchical context`, `Claude Code project memory`, `claude code docs CLAUDE.md`

### 2B — Custom Subagents (Specialized Roles)

Claude Code can spawn subagents — isolated Claude instances with their own context window, specialized instructions, and restricted tool access. You define them as markdown files in `.claude/agents/` with a YAML frontmatter that specifies the agent's name, description, allowed tools, and model. Claude Code will automatically invoke the right subagent based on the task, or you can explicitly request one.

**How to use it for learning:** Create three custom subagents that map directly to the three G→C→R phases. A "builder" agent that generates code from specs (Generate phase). A "teacher" agent that can only read code and explain it, with no write permissions (Comprehend phase). A "reviewer" agent that reviews your hand-written code against the original generated version and gives feedback, but never rewrites your code for you (Re-implement phase). This separation prevents the common trap where you ask for an explanation and the agent "helpfully" rewrites the code instead.

**Lookup keywords:** `Claude Code subagents .claude/agents/`, `Claude Code /agents command`, `custom agent frontmatter model tools`, `VoltAgent/awesome-claude-code-subagents` (GitHub repo with 100+ community subagent definitions you can study)

### 2C — Git Worktrees (Parallel Isolated Branches)

Git worktrees let you check out multiple branches from the same repository into separate directories, each with its own working files but sharing the same Git history. Claude Code has built-in support via the `--worktree` flag — it creates an isolated directory under `.claude/worktrees/`, and cleans it up when you are done.

**How to use it for learning:** This is the mechanism that makes Re-implement safe and stress-free. Your generated code lives on the `main` branch (or a `generated` branch). When you enter Re-implement phase, you launch `claude --worktree reimpl-phase2` which gives you a clean working copy where you can rebuild from scratch. If you get hopelessly stuck, the original is still on `main`. If your reimplementation works, you can compare the two branches with `git diff main..reimpl-phase2` to see exactly where your decisions diverged from the agent's — these divergence points are the highest-value learning moments. You can also run multiple worktrees simultaneously: one for your reimplementation, one where the teacher agent explains the generated version.

**Lookup keywords:** `git worktree add`, `claude --worktree`, `Claude Code worktree isolation`, `git worktree list`, `git worktree remove`

### 2D — Planning Mode and Extended Thinking

Claude Code has an explicit planning mode where it proposes a plan before executing any changes. You can trigger this by asking Claude to "plan first" or by using the `/plan` approach. Extended thinking gives Claude more reasoning time for complex architectural decisions. Both are valuable for the Generate phase because they make the agent's decision-making process visible to you, which feeds directly into Comprehend.

**How to use it for learning:** Always request planning mode during Generate. The plan itself becomes your first Comprehend artifact — before the code even exists, you have a document explaining what will be built and why. During the Generate phase, save the plan as a separate markdown file (`docs/plan-phase2.md`). During Comprehend, compare the plan to the actual code and note where they diverge. These divergences teach you about the gap between design and implementation.

**Lookup keywords:** `Claude Code planning mode`, `extended thinking budget`, `plan before execute workflow`

### 2E — Hooks (Automated Quality Gates)

Hooks are deterministic pre/post-execution rules that fire at specific points in Claude Code's workflow. For example, you can define a hook that runs `npm run build` after every file edit to catch TypeScript errors immediately, or a hook that runs your linter before any commit.

**How to use it for learning:** Set up a post-edit hook that runs `tsc --noEmit` (TypeScript type-checking without producing output files) after every file change. This gives you instant feedback during Re-implement phase — if your hand-written code has a type error, you see it within seconds rather than discovering it minutes later when you try to run the game. Hooks go in `.claude/hooks/` or in your `settings.json`. They teach you a broader lesson too: in professional development, automated quality gates are how teams maintain code quality at scale.

**Lookup keywords:** `Claude Code hooks system`, `pre-edit post-edit hooks`, `.claude/hooks/ configuration`

### 2F — Session Management (/compact, /resume, /clear)

Long Claude Code sessions accumulate context that can degrade response quality. `/compact` summarizes the conversation history to free up context window space. `/resume` lets you pick up a previous session by name. `/clear` starts fresh. These are critical for multi-day learning projects where you might work on the same feature across several sessions.

**How to use it for learning:** At the end of each coding session, run `/compact` with a brief summary of where you left off and what you plan to do next. Name your sessions descriptively (e.g., "phase2-step7-tilemap-rendering") so you can `/resume` them later. When switching between G→C→R phases, use `/clear` to start with a fresh context — this prevents the agent from "remembering" implementation details that would shortcut your learning in the new phase.

**Lookup keywords:** `Claude Code /compact`, `Claude Code /resume session picker`, `context window management`

### 2G — MCP Servers (External Tool Integration)

MCP (Model Context Protocol) lets Claude Code connect to external services — GitHub for PR management, databases, custom APIs, and more. While most MCP servers are aimed at production workflows, a few are directly useful for learning.

**How to use it for learning:** The GitHub MCP server lets Claude Code read your repository's issues, PRs, and commit history. You can create GitHub Issues for each G→C→R step (e.g., "Phase 2 Step 7: Tile Map Data Structure — Comprehend") and have Claude Code track your progress. The Filesystem MCP server can watch your project for changes. For now, MCP is a "be aware it exists" tool — you will use it more as you progress toward building your own agents.

**Lookup keywords:** `Model Context Protocol specification`, `Claude Code MCP integration`, `MCP server GitHub`, `claude code docs MCP`

---

## Part 3 — The Concrete Plan (Week by Week)

### Week 0: Tooling Setup (1 day)

**Objective:** Get your development environment ready so that tooling never blocks learning.

Do the following, in order. Each item should take 10–15 minutes.

Install Claude Code CLI globally. Verify it works by running `claude` in any directory and having a short conversation. Run `claude /doctor` to confirm everything is healthy.

Create a fresh project directory and initialize it: `mkdir zelda-rebuild && cd zelda-rebuild && git init && npm create vite@latest . -- --template vanilla-ts`. Run `npm install && npm run dev` to confirm the Vite dev server works. Open `localhost:5173` and see the default page.

Create your `CLAUDE.md` at the project root. Use the template in Prompt P-01 below. This tells every Claude Code session about your project, your learning methodology, and your current phase.

Create the three custom subagents. Use the templates in Prompts P-02, P-03, and P-04 below. Place them in `.claude/agents/`.

Set up a post-edit hook that runs `npx tsc --noEmit` after every file change, so type errors surface immediately.

Commit everything as your "scaffold" commit so you have a clean baseline to return to.

### Weeks 1–2: Stage 1 — Comprehend the Existing Project

**Objective:** Build a deep mental model of the agent-generated dungeon game before writing any code.

Open the existing `dungeon-crawler/` project (the one from your earlier Claude Code session) in a separate terminal. Do NOT modify any files. Your only job is understanding.

Use the teacher subagent (P-03) for guided walkthroughs. The prompts in Section P-05 below are designed for this stage. Work through them in order — they progress from high-level architecture down to individual function logic.

Keep an annotation file called `docs/comprehension-notes.md` where you write, in your own words, what each module does, why it makes the decisions it makes, and what would break if you changed specific things. Writing forces you to confront gaps in understanding that reading alone hides.

Do the pencil-and-paper tracing exercises described in the Learning Strategy Guide. Trace one full frame of the game loop. Trace a player movement with collision. Trace an attack that kills an enemy. Draw diagrams. This is not busywork — it is the highest-ROI learning activity in the entire plan.

By the end of Week 2, you should be able to explain the entire game architecture from memory to another person (or to Claude — use the prompt in P-06 to test yourself).

### Weeks 3–6: Stage 2 — Rebuild from Scratch (Phase 1–5)

**Objective:** Reconstruct the game from an empty canvas, one step at a time, writing every line yourself.

Launch a worktree for your rebuild: `claude --worktree rebuild-main`. This gives you an isolated workspace. The original generated project remains untouched on `main` as your reference.

Follow the Phase 1–5 breakdown from the earlier planning conversation. For each step, the workflow is the same. First, update the `## Current Phase` section in your CLAUDE.md to reflect what you are working on. Then, attempt to implement the step entirely on your own (this is a "No-AI Zone" — close Claude Code and work in your editor alone). When you get stuck, re-open Claude Code and ask conceptual questions using the teacher subagent — but do not let it write implementation code. After completing the step, use the reviewer subagent (P-04) to compare your implementation against the generated version and get feedback.

Keep a build log at `docs/build-log.md`. After each session, write 2–3 sentences about what you built, what surprised you, and what you want to tackle next.

At natural checkpoints (end of each Phase), run `git diff main..rebuild-main -- src/` to see how your implementation diverges from the generated version. Study these diffs carefully — they reveal your design instincts and where they differ from the agent's choices. Neither version is necessarily "better"; the point is understanding the tradeoffs.

### Weeks 7–8: Stage 3 — Extend with Plans 1B–1E

**Objective:** Add new features to YOUR codebase using the G→C→R cycle at feature level.

Now you are working on a codebase you built and fully understand. Plans 1B through 1E (from the `plans.md` file) become your feature specifications.

For each plan, run the full G→C→R cycle at feature scope. Generate: use the builder subagent (P-02) in a worktree (`claude --worktree gen-plan1b`) to implement the plan. Comprehend: study the generated code using the teacher subagent, annotate what it did and why. Re-implement: switch back to your rebuild worktree and implement the same feature yourself, referencing your annotations but not copying code.

This stage is also where you start experimenting with parallel worktrees. Have the builder agent generate Plan 1B in one worktree while you manually work on understanding Plan 1C's requirements in another.

### Weeks 9+: Stage 4 — Graduate to Co-Working Mode

**Objective:** Transition from learning mode to productive human-agent collaboration.

By this point you have deep understanding of the codebase, proven by having rebuilt it. Now you can relax the strict G→C→R protocol and shift to a collaborative workflow where you and the agent work together in real-time. You write the architectural decisions and tricky logic. The agent handles boilerplate, repetitive patterns, and the tedious parts. You review everything it produces because you understand every pattern in the codebase.

This is where the more advanced tools become relevant. Use parallel worktrees to have agents prototype multiple approaches to a feature while you evaluate which one is better. Define custom agents for specific tasks (a "level-designer" agent that generates level string templates, a "playtester" agent that reviews game balance). Experiment with hooks that enforce your coding standards automatically.

The goal of this stage is not a finished game (though that would be nice). The goal is fluency in the human-model co-working pattern — the ability to direct agents effectively because you understand both the code and the tools.

---

## Part 4 — Prompt Library

### P-01: CLAUDE.md Template for Learning Project

Drop this into your project root as `CLAUDE.md`. Update the `Current Phase` section as you progress.

```markdown
# Zelda Dungeon Rebuild — Learning Project

## Project Overview
A top-down 2D Zelda-like dungeon game built with TypeScript + HTML5 Canvas + Vite.
This is a learning project following the Generate → Comprehend → Re-implement methodology.

## Tech Stack
- TypeScript (strict mode)
- HTML5 Canvas 2D (no game frameworks)
- Vite (build tool)

## Architecture
[Update this section as you build each system — document what exists and how it connects]

## Learning Mode — ACTIVE

### Current Phase
> **Stage:** [Comprehend / Re-implement / Extend]
> **Focus:** [e.g., "Phase 2 Step 9 — Tile Map Rendering"]
> **Constraint:** [e.g., "Do not generate implementation code. Only explain concepts and answer questions."]

### G→C→R Rules for All Agents
1. If Current Phase is "Comprehend": explain and teach only. Never produce implementation code. Use analogies, diagrams in ASCII, and trace-throughs. Ask the human to predict outputs before revealing answers.
2. If Current Phase is "Re-implement": answer conceptual questions only. If the human asks "how do I implement X", respond with the concept and the relevant API names, but do NOT write the function. The human must write every line.
3. If Current Phase is "Extend": full collaboration is permitted, but always explain the reasoning behind generated code. Never silently produce code without justification.

### No-Copy Rule
The generated reference project exists at ../dungeon-crawler/. It may be consulted but never copy-pasted from. If the human asks to "just use the code from the reference", remind them of the No-Copy Rule and offer to explain the relevant concept instead.

## Commands
npm install       # Install dependencies
npm run dev       # Vite dev server at localhost:5173
npm run build     # Type-check + build
```

---

### P-02: Builder Subagent (Generate Phase)

Save as `.claude/agents/builder.md`:

```markdown
---
name: builder
description: Generates implementation code from specifications. Use during the Generate phase of G→C→R. Produces working, well-commented code that follows the project architecture.
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

You are a senior TypeScript game developer implementing features for a Zelda-like dungeon crawler.

## Your Role
You receive feature specifications and produce working implementations. Your code must:
- Follow the existing architecture patterns in the codebase
- Include clear comments explaining WHY each decision was made (not just what the code does)
- Use TypeScript strict mode — no `any` types, no type assertions unless absolutely necessary
- Check `isSolid()` for all movement, check bounds for all rendering

## Your Constraints
- Always run `npx tsc --noEmit` after making changes to verify type safety
- Always run `npm run build` before declaring a task complete
- If you need to make an architectural decision not covered by the spec, document it in a code comment starting with `// DECISION:`
- Produce a brief summary of every file you changed and why, formatted as a markdown list, after completing the task

## Context
Read CLAUDE.md for current project state. Read src/ directory structure before starting any task.
```

---

### P-03: Teacher Subagent (Comprehend Phase)

Save as `.claude/agents/teacher.md`:

```markdown
---
name: teacher
description: Explains code, traces execution, and teaches concepts. Use during the Comprehend phase of G→C→R. NEVER writes or modifies code. Read-only access only.
tools: Read, Grep, Glob
model: sonnet
---

You are a patient, expert programming tutor specializing in TypeScript, game development, and software architecture.

## Your Role
You help the human understand existing code deeply. You explain concepts, trace execution paths, draw ASCII diagrams, and ask Socratic questions. You adapt your explanations to someone who understands programming fundamentals but is learning TypeScript and game development patterns for the first time.

## Your Absolute Constraints
- You NEVER write implementation code, not even "here's how you could do it" snippets
- You NEVER modify any file in the project
- When the human asks "how does X work?", trace through the EXISTING code to explain it
- When the human asks "how would I build X?", describe the concept, name the relevant APIs, but do NOT write the function body
- If you catch yourself about to write code, STOP and instead describe what the code would need to do in plain English

## Teaching Methods
- Trace-throughs: Walk through a function call-by-call, showing the state at each step
- Predict-then-reveal: Ask "what do you think happens when..." before explaining
- Analogy-first: Connect new concepts to things the human already knows
- Gotcha-highlighting: Proactively point out common TypeScript and Canvas pitfalls
- ASCII diagrams: Draw grid positions, bounding boxes, and data flow when spatial reasoning helps

## Context
The human is studying a Zelda-like dungeon game. Read CLAUDE.md for current learning focus.
```

---

### P-04: Reviewer Subagent (Re-implement Phase)

Save as `.claude/agents/reviewer.md`:

```markdown
---
name: reviewer
description: Reviews hand-written code by comparing it against a reference implementation. Gives feedback without rewriting. Use during the Re-implement phase of G→C→R.
tools: Read, Grep, Glob
model: sonnet
---

You are a constructive code reviewer comparing the human's hand-written implementation against a reference version.

## Your Role
You read both versions, identify meaningful differences, and provide feedback that deepens understanding. You NEVER rewrite the human's code — you point out issues and let them fix it.

## Your Absolute Constraints
- You NEVER produce corrected code, replacement functions, or "here's the fix" snippets
- When you find a bug, describe WHAT is wrong and WHY it matters, then ask the human how they would fix it
- When you find a design divergence from the reference, explain the tradeoff — the human's choice may be equally valid

## Feedback Categories
Use these labels for every piece of feedback:
- **BUG**: Something that will cause incorrect behavior at runtime
- **TYPE-SAFETY**: A TypeScript type issue that tsc might not catch but could cause problems
- **DIVERGENCE**: A design decision that differs from the reference — explain the tradeoff, don't assume the reference is correct
- **IMPROVEMENT**: Something the human did BETTER than the reference — positive reinforcement matters
- **EDGE-CASE**: A scenario the human's code doesn't handle (e.g., entity at map boundary, frame rate spike, tab-switch)

## Process
1. Read the human's implementation file
2. Read the corresponding reference file
3. Produce a structured review using the labels above
4. End with one concrete question that pushes the human's understanding deeper

## Context
Human's code is in the current worktree. Reference code is at ../dungeon-crawler/. Read CLAUDE.md for current focus.
```

---

### P-05: Comprehend Phase — Guided Study Prompts

Use these prompts in sequence with the teacher subagent. Each builds on the previous one.

**Prompt 1 — Architecture Overview:**
```
I'm studying the dungeon-crawler project to understand its architecture before I rebuild it from scratch.
Start by reading every file in src/ and giving me a top-down overview: what are the major systems,
how do they connect, and what is the data flow through one complete frame of the game loop?
Draw an ASCII diagram showing the call chain from requestAnimationFrame through to pixels on screen.
```

**Prompt 2 — State Machine Deep Dive:**
```
Now focus on the GameState enum and how state transitions work in Game.ts.
Trace what happens when: (a) the game starts, (b) the player dies, (c) the player beats all
enemies and steps on stairs, (d) the player beats the final level.
For each transition, tell me: what triggers it, what state changes, and what the player sees.
```

**Prompt 3 — Movement and Collision:**
```
Explain the difference between the player's grid-snapped movement model and the enemies'
continuous pixel-based movement. Why are they different? What would break if the player
used continuous movement instead? Walk me through a specific example: the player is at
grid position (3, 4) and presses Right, but (4, 4) is a wall. Trace every function call.
```

**Prompt 4 — Combat System:**
```
Trace an attack sequence from the moment I press the attack key to the moment an enemy
is removed from the game. Include: how the attack hitbox position is calculated, how
CombatSystem.processAttacks() detects the overlap, and what happens in the kill callback.
What is AABB collision detection and why is it used here instead of pixel-perfect collision?
```

**Prompt 5 — Level System:**
```
Explain how levels are defined, parsed, and loaded. Start from the string template in levels.ts,
trace through parseLevelString(), and show me exactly how a character like '*' becomes a
PatrolEnemy entity on screen. What does "deep copy the grid on load" mean and why is it
necessary for restarts?
```

---

### P-06: Self-Test Prompt (End of Comprehend Phase)

Use this to verify you have actually internalized the architecture. Run it in a fresh Claude Code session with NO access to the source code (use `/clear` first, do not have the project directory open).

```
I'm going to explain a game architecture to you from memory, and I want you to play
the role of a skeptical senior developer. Challenge every claim I make. If I'm vague,
ask me to be specific. If I'm wrong, tell me I'm wrong but don't give me the answer —
ask me to think about it again.

The game is a top-down Zelda-like dungeon crawler built with TypeScript and HTML5 Canvas.
I'll explain the architecture system by system. Start by asking me about the game loop.
```

---

### P-07: Re-implement Phase — Start Fresh

Use this when beginning Stage 2 (Weeks 3–6). Run it from your rebuild worktree.

```
I'm starting a fresh rebuild of my Zelda dungeon game. I've already studied the architecture
of a reference implementation and I understand the major systems. I'm now in Re-implement phase:
I will write all the code myself. Your role is to answer CONCEPTUAL questions only — never
write implementation code for me, not even small functions.

Right now I'm on Phase 1, Step 1: project scaffolding. I've already run npm create vite@latest
with the vanilla-ts template. What should I understand about tsconfig.json before I start
writing game code? Explain the key compiler options that matter for a Canvas game project.
```

---

### P-08: Diff Review Prompt (End of Re-implement Phase)

Use this after completing a Phase to study how your implementation differs from the reference.

```
I've just completed my own implementation of [Phase X]. I want to compare my version
against the reference implementation at ../dungeon-crawler/. Please read both versions
and give me a structured comparison:

1. What did I implement DIFFERENTLY and what are the tradeoffs of each approach?
2. What did I MISS that the reference handles (edge cases, error handling, etc.)?
3. What did I do BETTER or more cleanly than the reference?
4. What TypeScript patterns or Canvas APIs did I use differently, and what should I learn from the difference?

Focus on meaningful architectural and behavioral differences, not style/formatting.
```

---

## Part 5 — Lookup Keywords and Resources

Rather than linking to specific articles (which go stale), here are precise search terms that will lead you to the right documentation and community discussions. Use these when you want to go deeper on any tool or concept mentioned in this plan.

**Claude Code fundamentals:** `claude code docs getting started`, `claude code CLI reference`, `CLAUDE.md file format`, `claude code /init command`

**Subagents and custom agents:** `Claude Code custom agents .claude/agents/`, `Claude Code /agents setup`, `agent frontmatter model tools permissionMode`, `Claude Code Task tool subagent`, `VoltAgent/awesome-claude-code-subagents GitHub`

**Git worktrees:** `git worktree tutorial`, `claude --worktree flag`, `Claude Code parallel worktrees tmux`, `Boris Cherny Claude Code worktree tips` (Boris Cherny is the Anthropic engineer who created Claude Code — his posts are consistently the most practical source on advanced workflows)

**Hooks:** `Claude Code hooks system documentation`, `pre-edit post-edit hooks claude code`, `.claude/hooks/ examples`

**Session management:** `Claude Code /compact /resume /clear`, `Claude Code context window management`, `session compaction`

**MCP (for later stages):** `Model Context Protocol specification`, `Claude Code MCP server configuration`, `MCP server GitHub integration`, `building MCP servers FastMCP Python`

**Broader agentic coding ecosystem:** `agenticoding.ai CLI coding agents` (a comparison site covering Claude Code, Codex CLI, Gemini CLI, Copilot CLI — useful for understanding what is unique to each tool), `sankalp bearblog Claude Code 2.0` (a deeply practical guide written by a power user), `Anthropic building agents Claude Agent SDK` (Anthropic's own engineering blog post on agent architecture patterns)

**Game development concepts (for when you're stuck on game-specific problems):** `HTML5 Canvas game loop requestAnimationFrame`, `fixed timestep vs variable delta time game loop`, `AABB collision detection 2D`, `tile-based collision grid snapped movement`, `sprite sheet animation Canvas 2D`, `game state machine pattern`

---

## Part 6 — Build Log Template

Create this file at `docs/build-log.md` on your first day and update it after every session.

```markdown
# Build Log — Zelda Dungeon Rebuild

## Session Template
Date | Phase | Stage | Duration | Summary

---

### [DATE] — [Phase X, Step Y] — [Comprehend/Re-implement/Extend]
**Duration:** X hours
**What I built/studied:** [1-2 sentences]
**What surprised me:** [1 sentence — the most unexpected thing from this session]
**Key concept learned:** [1 sentence — name the concept and why it matters]
**Next session:** [What I plan to do next]
**Mood:** [How am I feeling about the project? Honest check-in for motivation tracking]
```

---

## Part 7 — Progression Milestones

These are not deadlines — they are checkpoints that tell you when you are ready to move to the next stage. Do not advance until the milestone is met.

**Milestone 1 — "I Can Explain It" (End of Stage 1, Comprehend):**
You can explain the entire game architecture to Claude (using prompt P-06) for 15 minutes without looking at the code, and Claude's skeptical questions do not stump you for more than 30 seconds.

**Milestone 2 — "I Can Build the Foundation" (End of Phase 2 in Stage 2):**
You have a working game with a tiled room, a movable player with collision detection, and keyboard input — all written by you, with no copy-paste from the reference.

**Milestone 3 — "I Can Build Game Systems" (End of Phase 4 in Stage 2):**
You have enemies that move, a combat system with hitboxes, and a game-over state — all written by you. Your reviewer subagent confirms no critical bugs.

**Milestone 4 — "I Can Extend Independently" (End of Stage 3):**
You have implemented at least two of Plans 1B–1E on your own codebase, using the G→C→R cycle at feature level. You can write a feature specification and implement it without needing the agent to do it first.

**Milestone 5 — "I Am an AI-Native Developer" (Stage 4, Ongoing):**
You naturally switch between writing code yourself and directing agents based on which approach is faster for the task at hand. You can debug agent-generated code as confidently as your own. You write CLAUDE.md files and custom agents for new projects without referring to templates. You understand when to use an agent and when to think for yourself — and you choose correctly most of the time.

---

## Closing Note

This plan is long because it is a map of a multi-week journey. But the daily execution is simple. Each session, you do one of three things: study code and annotate your understanding, write code from your own understanding, or review the difference between your code and the reference. Everything else — the tools, the subagents, the worktrees — exists to make those three activities smoother and more effective.

The tools are accelerants, not replacements for understanding. A git worktree does not teach you collision detection. A subagent does not give you the instinct for when a game loop's delta time is wrong. Those things come from the pencil-and-paper tracing, the "No-AI Zone" coding sessions, and the moments where your code breaks and you have to figure out why. The tools just make sure you spend your time on those high-value activities instead of on fighting your development environment.

Start with Week 0. Set up the tooling. Then open the reference project and begin reading.
