# Skills Audit

**Date:** 2026-03-13
**Project:** zelda-antigravity / dungeon-crawler
**Phase:** Comprehend

This document inventories every skill available in this Claude Code session, evaluates each against
three questions, and ends with a ranked table of the highest-leverage integrations with the six
learning agents.

---

## How to Read This Document

For each skill the audit answers:

1. **TRIGGER** — what user action or context causes Claude to invoke this skill automatically, or
   how the user invokes it manually.
2. **CAPABILITY** — specific things this skill does that plain Claude Code cannot do without it
   (bundled scripts, reference files, structured workflows, or domain expertise).
3. **LEARNING FIT** — which of the six learning agents (Examiner, Cartographer, Challenger,
   Scaffolder, Saboteur, Architect) could leverage this skill, and how.

---

## Part 1 — Skills with Local SKILL.md Files

### 1. `claude-automation-recommender`

**Source:** `claude-code-setup` plugin
**Invocation:** User mentions "automation recommendations", "optimize Claude Code setup",
"improve workflows", or "how to first set up Claude Code for a project".

**TRIGGER**
Fires when the user wants to know which Claude Code extensibility features (hooks, agents, skills,
plugins, MCP servers) would benefit their specific codebase. Also fires on first-time project setup
questions.

**CAPABILITY**
- Reads `package.json`, directory structure, and existing `.claude/` config to build a codebase
  profile.
- Cross-references five recommendation categories (hooks, agents, skills, plugins, MCP servers)
  against detected signals (framework, database, CI/CD, issue tracker).
- Outputs a ranked, codebase-specific report with copy-paste configuration snippets — not generic
  advice.
- Knows to recommend `context7` MCP for popular library docs, Playwright MCP for frontend testing,
  GitHub MCP for repo workflows, etc.
- Ends every report noting users can ask for deeper recommendations per category.

**LEARNING FIT**
- **Cartographer**: After mapping a new module, could recommend which MCP server or hook would give
  instant docs or auto-lint for that module's language.
- **Architect**: When reviewing a new feature's structure, could surface whether a dedicated skill
  or agent would be worth packaging for that feature's workflow.
- **Scaffolder**: After scaffolding a module, could recommend a `gen-test` or `new-component` skill
  to accelerate the re-implement cycle.

---

### 2. `claude-md-improver`

**Source:** `claude-md-management` plugin
**Invocation:** User asks to "audit", "improve", "check", or "update" CLAUDE.md; mentions "project
memory optimization".

**TRIGGER**
Fires on any request to maintain or improve CLAUDE.md quality. Can be invoked proactively after
major structural refactors.

**CAPABILITY**
- Discovers all CLAUDE.md variants (project root, `.claude.local.md`, `~/.claude/CLAUDE.md`,
  monorepo per-package files) automatically.
- Scores each file on six weighted criteria (commands, architecture clarity, non-obvious patterns,
  conciseness, currency, actionability) and assigns letter grades A–F.
- Outputs a structured diff format showing exactly what to add and why, rather than rewriting the
  whole file.
- Reminds users of the `#` shortcut to auto-incorporate learnings mid-session.
- Preserves existing content structure during edits; never rewrites what is already good.

**LEARNING FIT**
- **Cartographer**: After each Comprehend session, invoking this skill keeps CLAUDE.md current with
  newly discovered architectural facts and gotchas — ensuring future cartographer runs start with
  accurate project context.
- **Examiner**: Can be used to capture Socratic insights discovered during examination sessions
  into the project's permanent CLAUDE.md so they are not lost.
- **Architect**: After an Extend session adds a new system, ensures CLAUDE.md reflects updated
  architecture so all future agents have correct context.

---

### 3. `frontend-design`

**Source:** `frontend-design` plugin
**Invocation:** User asks to "build", "create", or "design" a web component, page, or interface.

**TRIGGER**
Fires on any frontend UI creation request.

**CAPABILITY**
- Enforces a "bold aesthetic direction" decision before any code is written (tone, differentiation,
  constraints) — preventing generic AI-slop output.
- Injects production-grade typography rules: forbids overused fonts (Inter, Roboto, Arial) and
  requires distinctive pairings.
- Provides explicit motion guidelines: CSS-only animations for HTML, Motion library for React,
  scroll-triggered and hover states.
- Covers spatial composition principles (asymmetry, overlap, diagonal flow, grid-breaking).
- Mandates varying between light/dark themes and different aesthetics across generations so no two
  outputs look the same.

**LEARNING FIT**
- Low direct fit with the six Comprehend-phase learning agents in this project (dungeon-crawler
  uses canvas, not DOM UI).
- **Challenger**: If a future challenge extends the game with an HTML/CSS menu or HUD overlay,
  this skill ensures the result is visually distinctive rather than placeholder-quality.
- **Scaffolder**: Could produce a polished game-over or victory screen template that learners then
  re-implement from scratch as a scaffold exercise.

---

### 4. `writing-hookify-rules`

**Source:** `hookify` plugin
**Invocation:** User asks to "create a hookify rule", "configure hookify", "add a hook rule", or
needs hookify syntax help.

**CAPABILITY**
- Teaches the exact SKILL.md-adjacent `.claude/hookify.{name}.local.md` file format with YAML
  frontmatter (`event`, `pattern`, `action`, `conditions`).
- Covers all four event types: `bash`, `file`, `stop`, `prompt`.
- Provides multi-condition rule syntax with six operators (`regex_match`, `contains`, `equals`,
  `not_contains`, `starts_with`, `ends_with`).
- Includes regex writing tips with Python-flavored examples and common pitfall warnings (too
  broad, too specific, escaping issues).
- Lists file naming convention: `.claude/hookify.{descriptive-name}.local.md`.
- References bundled examples directory for dangerous-rm, console-log, sensitive-file patterns.

**LEARNING FIT**
- **Saboteur**: Can create a `stop`-event hookify rule that fires a completion checklist ("Did you
  document the symptom? Did you create a git checkpoint?") every time a session ends, enforcing
  the saboteur's safety protocol without manual reminders.
- **Challenger**: A `file`-event rule watching `src/**/*.ts` for `console.log` writes trains the
  learner to avoid debug pollution during challenge attempts.
- **Examiner**: A `stop`-event rule could remind the examiner to save a difficulty progression
  note before ending the session.

---

### 5. `agent-development`

**Source:** `plugin-dev` plugin
**Invocation:** User asks to "create an agent", "write a subagent", needs guidance on "agent
frontmatter", "agent tools", "agent colors", or "autonomous agent" patterns.

**CAPABILITY**
- Provides the complete agent file format (frontmatter + system prompt) with field-by-field
  documentation.
- Documents the `description` field's `<example>` / `<commentary>` block syntax that controls
  when Claude auto-triggers an agent — the single most critical field for agent reliability.
- Covers `model` inheritance (`inherit` / `sonnet` / `opus` / `haiku`) and color conventions
  (`blue`/`cyan` = analysis, `green` = success, `red` = critical, `magenta` = creative).
- Specifies `tools` scoping with least-privilege tool sets for common patterns
  (read-only analysis, code generation, testing, full access).
- Provides system prompt structural template: role → responsibilities → process → quality
  standards → output format → edge cases.

**LEARNING FIT**
- **Architect**: Directly useful when designing a new custom learning agent. Ensures `description`
  field examples are well-formed so auto-triggering works reliably.
- **Scaffolder**: When the scaffolder creates a new `docs/scaffold-[module].md` spec, this skill
  can help wrap it in an agent that auto-invokes during Re-implement phase.
- **Cartographer**: Can help improve the cartographer's `description` field examples to better
  cover the module/system/decision trigger patterns this project actually uses.

---

### 6. `command-development`

**Source:** `plugin-dev` plugin
**Invocation:** User asks to "create a slash command", "add a command", needs "command frontmatter"
or "dynamic argument" guidance.

**CAPABILITY**
- Explains the critical distinction: commands are instructions *for Claude*, not messages *to the
  user* — a common authoring mistake.
- Documents three command locations (`.claude/commands/` project-scoped, `~/.claude/commands/`
  user-scoped, plugin `commands/` plugin-bundled) and when to use each.
- Covers YAML frontmatter for commands: `allowed-tools`, `description`, `disable-model-invocation`
  (user-only commands), `user-invocable: false` (Claude-only).
- Shows `$ARGUMENTS` placeholder syntax for parameterized commands and `!bash` execution blocks
  for injecting dynamic context.

**LEARNING FIT**
- **Examiner**: Create a `/examine [file]` slash command that invokes the examiner agent on the
  specified file — giving the user a one-line shortcut instead of a longer prompt.
- **Challenger**: Create a `/challenge [file]` command that triggers a challenge session on demand.
- **Saboteur**: Create a `/inject-bug` command with `disable-model-invocation: true` that runs the
  saboteur's git-checkpoint + injection workflow in a controlled, user-initiated way.

---

### 7. `skill-development`

**Source:** `plugin-dev` plugin
**Invocation:** User asks to "create a skill", "add a skill to plugin", "write a new skill", or
needs guidance on skill structure or progressive disclosure.

**CAPABILITY**
- Defines the three-level progressive disclosure loading system:
  1. Metadata (name + description) — always in context (~100 words)
  2. SKILL.md body — loads on trigger (<5k words)
  3. Bundled resources (`scripts/`, `references/`, `assets/`) — loaded by Claude as needed
- Explains when to bundle scripts (deterministic, token-efficient, avoids rewriting), references
  (domain docs, schemas, API specs loaded into context), and assets (templates, images, boilerplate
  used in output but not loaded into context).
- Provides the 6-step Skill Creation Process: examples → description → bundled resources →
  SKILL.md draft → eval → iterate.
- Warns against duplicating info between SKILL.md and references files; prefers references for
  detailed material.

**LEARNING FIT**
- **Scaffolder**: Directly applicable. The scaffolder produces `docs/scaffold-[module].md` files;
  this skill explains how to package that workflow into a reusable skill with bundled module spec
  templates.
- **Examiner**: Could package question-bank references (difficulty progression notes, question
  templates by topic) as bundled `references/` files that load when the examiner triggers.
- **Architect**: Could bundle architecture decision record (ADR) templates in `assets/` so the
  architect can stamp out ADRs consistently for each Extend session.

---

### 8. `skill-creator`

**Source:** `skill-creator` plugin
**Invocation:** User wants to "create a skill from scratch", "update or optimize an existing
skill", "run evals to test a skill", or "benchmark skill performance".

**CAPABILITY**
- Drives an iterative skill-creation loop: intent capture → draft → test prompts → qualitative
  review → quantitative evals → rewrite → repeat.
- Includes `eval-viewer/generate_review.py` script for running benchmarks in the background while
  reviewing qualitative results simultaneously.
- Adapts communication complexity to user's technical fluency (explains "JSON", "assertion" only
  when cues confirm user knows them).
- Can extract a skill from a past conversation: scans tools used, step sequence, corrections made,
  input/output formats observed.
- Has a separate description-optimizer workflow specifically for improving skill `description`
  fields to maximize auto-trigger accuracy.

**LEARNING FIT**
- **Examiner + Cartographer + Challenger**: After observing that a learning agent's description
  field is triggering too rarely or too broadly, `skill-creator` provides the eval-and-iterate
  loop to tune it quantitatively.
- **Architect**: When the architect agent is updated after an Extend session, `skill-creator` can
  run evals to verify it triggers on the right architectural review contexts.
- **All agents**: The most meta-useful skill — any time a learning agent is underperforming,
  `skill-creator` provides the formal process for improving it.

---

## Part 2 — Built-in Session Skills (No Local SKILL.md)

These four skills ship with Claude Code itself and are always available.

### 9. `keybindings-help`

**TRIGGER**
User asks about keyboard shortcuts, wants to customize keybindings, or mentions
`keybindings.json`.

**CAPABILITY**
- Provides Claude Code's built-in keyboard shortcut reference.
- Guides users through customizing `~/.claude/keybindings.json` with key-action mappings.
- Plain Claude Code can explain keybindings from training data, but this skill has authoritative,
  up-to-date shortcut definitions.

**LEARNING FIT**
- **All agents**: Create shortcuts for invoking the six learning agents by name (e.g., a binding
  that pastes "use the examiner agent on [file]") to reduce friction during learning sessions.
- **Challenger**: A binding for "next challenge" speeds up the rapid iteration loop.

---

### 10. `simplify`

**TRIGGER**
User asks Claude to review recently changed code for reuse, quality, or efficiency opportunities.
Typically invoked after a code change.

**CAPABILITY**
- Performs a focused post-change review specifically targeting: redundant code, missed reuse
  opportunities, and efficiency improvements.
- Scoped to *changed* code rather than the whole codebase — keeps the review actionable.
- Does not add features; only surfaces simplification opportunities.

**LEARNING FIT**
- **Challenger**: After a learner completes a challenge modification, `/simplify` gives immediate
  feedback on code quality without requiring a full code review — directly reinforcing the
  challenge's learning objective.
- **Scaffolder**: During Re-implement phase, after the learner submits their rebuilt module,
  `simplify` identifies where their implementation is more complex than necessary — a concrete
  signal to compare against the reference.
- **Architect**: After an Extend session, confirms the new feature code is as lean as the existing
  codebase before the architect reviews structural decisions.

---

### 11. `loop`

**TRIGGER**
User asks to run a prompt or slash command "every N minutes/hours", or on a "recurring interval".

**CAPABILITY**
- Schedules any prompt or slash command to execute on a repeating timer.
- Runs entirely within the Claude Code session — no external cron setup required.
- Can be stopped on demand.

**LEARNING FIT**
- **Saboteur**: Schedule a periodic "has the learner found the bug yet?" status check that gives
  warmer/colder hints on a timer without the learner having to ask.
- **Examiner**: Run a "daily comprehension check" loop that asks one question every 30 minutes
  during a focused study session.
- **Build monitoring**: Loop a `npm run build` check every few minutes during a Re-implement
  session to catch type errors as they accumulate.

---

### 12. `claude-api`

**TRIGGER**
User wants to build an app with the Claude API, needs help with the Anthropic SDK, or asks about
API usage patterns.

**CAPABILITY**
- Provides authoritative Anthropic SDK usage patterns (messages, streaming, tool use, structured
  output).
- Covers API authentication, model selection, and rate limiting best practices.
- Plain Claude Code knows the API from training data; this skill has current, accurate SDK
  documentation.

**LEARNING FIT**
- **Scaffolder**: If a Re-implement exercise involves rebuilding a module that calls the Claude
  API (e.g., a hint system powered by Claude), this skill provides the SDK scaffold.
- **Examiner / Cartographer**: If the learning journey eventually involves building a Claude-
  powered feature on top of the dungeon crawler, this skill handles the API integration layer.
- **Low priority for current Comprehend phase** — most relevant if the project moves to an
  AI-powered feature during Extend phase.

---

## Part 3 — Ranked Integration Table

Skills ranked by **learning impact ÷ implementation effort** for the current project and phase.
Impact = how much it accelerates the six learning agents. Effort = work to configure and verify.

| # | Skill | Primary Agent(s) Enhanced | Enhancement Description |
|---|-------|--------------------------|------------------------|
| 1 | `simplify` | Challenger, Scaffolder | Zero setup; invoke immediately after any challenge attempt or re-implement submission. Gives the learner instant, scoped quality feedback that the learning agents themselves cannot provide — closing the "is my version good?" loop without a full review. |
| 2 | `writing-hookify-rules` | Saboteur, Examiner | Low effort (one `.local.md` file per rule). A `stop`-event rule enforces the saboteur's safety checklist on every session end; a `file`-event rule catches debug noise during challenges. Converts safety protocols from manual memory into automatic enforcement. |
| 3 | `skill-creator` | All six agents | Medium effort (eval setup). The meta-skill: when any of the six learning agents is misfiring — triggering too rarely, too broadly, or producing off-topic output — `skill-creator` provides the formal eval-and-iterate process to fix it. Pays compound interest across the full learning framework. |
| 4 | `command-development` | Examiner, Challenger, Saboteur | Low effort (one `.md` file per command). Create `/examine [file]`, `/challenge [file]`, and `/inject-bug` slash commands so the learner can invoke each learning mode with a single line instead of a paragraph prompt. Reduces cognitive overhead during sessions. |
| 5 | `skill-development` | Scaffolder, Examiner | Medium effort (packaging existing workflows). The scaffolder already produces `docs/scaffold-*.md` files; this skill explains how to graduate them to reusable skills with bundled module-spec templates and question-bank references. Makes learning artifacts shareable and composable. |
| 6 | `agent-development` | Architect, Cartographer | Medium effort (description field rework). Strengthens the `description` field examples in the learning agents' `.md` files so Claude auto-triggers them reliably. The architect and cartographer agents are the most context-sensitive; better trigger examples reduce missed invocations. |
| 7 | `claude-md-improver` | Cartographer, Architect | Low effort (run once per Extend session). Keeps CLAUDE.md accurate after each learning session so future cartographer and architect invocations start with correct architectural context. Prevents compounding drift where agents work from stale project descriptions. |
| 8 | `claude-automation-recommender` | Cartographer, Scaffolder | Low effort (run once at project setup). Produces a codebase-specific list of hooks and MCP servers that would accelerate the learning loop (e.g., `context7` for live TypeScript docs, a type-check hook for Re-implement sessions). |
| 9 | `keybindings-help` | All six agents | Minimal effort (one config file). Define shortcuts for each learning-agent invocation pattern to cut prompt-typing time during high-iteration phases like Challenger and Examiner. |
| 10 | `loop` | Saboteur, Examiner | Low effort (one command). Schedule periodic hint reveals for the saboteur ("warmer/colder" on a timer) or spaced-repetition question prompts during Examiner sessions. |
| 11 | `skill-creator` (description optimizer) | All six agents | Medium effort (eval runs). Secondary use: run the description-optimizer workflow specifically on existing learning agent `.md` files to maximize auto-trigger accuracy. Separate from the general `skill-creator` ranking above because this sub-workflow is lower-risk and more focused. |
| 12 | `frontend-design` | Challenger (future) | High effort, low current fit. Relevant only if a future Challenger exercise involves building an HTML/CSS game menu or overlay. Deferred until Extend phase UI work begins. |

---

## Summary

**Highest-priority actions based on this audit:**

1. Invoke `/simplify` after every Challenger or Scaffolder session — zero setup, immediate value.
2. Use `writing-hookify-rules` to create a `stop`-event safety checklist for Saboteur sessions.
3. Create `/examine`, `/challenge`, `/inject-bug` slash commands using `command-development` guidance.
4. Run `claude-md-improver` after each Extend session to keep CLAUDE.md accurate for agents.
5. When a learning agent misfires, reach for `skill-creator` to iterate on its description field.
