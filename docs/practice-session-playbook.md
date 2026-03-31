# Practice Session Playbook

A structured guide for working through the dungeon-crawler codebase using the G→C→R (Generate → Comprehend → Re-implement) framework and the six learning agents.

---

## Before Every Session

1. Open `docs/build-log.md` (create it if it doesn't exist) and read your last entry.
2. Write today's session goal at the top before you begin.
3. Set a timer — **60–90 minutes maximum**. Deep practice has hard diminishing returns past 90 minutes. Stop even if you're mid-task.

---

## The Three Chains

### Comprehend Chain
`cartographer → examiner → challenger`

Use this chain to deeply understand existing code before touching it.

### Rebuild Chain
`scaffolder → (solo rebuild) → examiner → saboteur`

Use this chain to re-implement a module from scratch and test your implementation.

### Extend Chain
`cartographer → (implement) → architect`

Use this chain when adding genuinely new features to the game.

---

## Day-by-Day Session Guide

### Day 1 — Orient the Full Map

**Goal:** Know what you're looking at before you read any single file in depth.

1. `use the cartographer agent on the full project` (point it at `dungeon-crawler/src/`)
2. From the cartographer's output, identify the top 5 "MUST UNDERSTAND NOW" concepts.
3. `use the examiner agent on` the first concept — work until you reach Tier 2 correct.
4. Log to `docs/build-log.md`: what you covered, which concepts feel shaky.

**Done when:** You can explain the game loop, the state machine, and the movement model in one sentence each without looking.

---

### Day 2 — Deepen and Stress-Test

**Goal:** Push from recall (Tier 2) to prediction (Tier 3), and find the first cracks.

1. Re-read your `docs/build-log.md` entry from Day 1.
2. `use the examiner agent on` your weakest Day 1 concept — push to Tier 3.
3. `use the challenger agent on` the file that covers your weakest area — work through at least two Trivial/Low modifications.
4. Log: what surprised you during the challenger exercises.

**Done when:** At least one prediction during the challenger exercise was wrong and you understand why.

---

### Day 3 — First Rebuild Attempt

**Goal:** Rebuild the simplest load-bearing module from scratch.

Recommended first module: `CollisionSystem.ts` (small, self-contained, testable in the running game).

1. Re-read `docs/build-log.md`.
2. `use the scaffolder agent on CollisionSystem.ts` — read the spec, ask clarifying conceptual questions.
3. Close the reference file. Open a blank file. Build from the spec alone — no peeking.
4. When declared complete: return to the scaffolder agent for post-rebuild comparison.
5. `use the examiner agent on your rebuilt CollisionSystem` — can you answer Tier 2 questions about code you just wrote?
6. Log: every BUG and EDGE-CASE finding from the comparison.

**Done when:** Your rebuild passes the post-rebuild comparison with no BUGs (DIVERGENCE and IMPROVEMENT are fine).

---

### Day 4 — Debugging Under Pressure

**Goal:** Find a bug you didn't put there. Build debugging instincts.

1. Re-read `docs/build-log.md`.
2. `use the saboteur agent on` your rebuilt CollisionSystem (or another file you know well).
3. Debug without AI help for at least 20 minutes before asking for a hint.
4. When found: fix it, then write in `docs/build-log.md` exactly how you found it (what clue cracked it).
5. `use the scaffolder agent on CombatSystem.ts` — read the spec; don't start rebuilding yet.

**Done when:** Bug found and fixed. Scaffold for next module in hand.

---

### Day 5+ — Continue the Rebuild Chain

**Goal:** Rebuild modules in dependency order (foundations first).

Recommended order:
1. `CollisionSystem.ts` (Day 3)
2. `CombatSystem.ts`
3. `InputManager.ts`
4. `LevelManager.ts`
5. `Entity.ts` + `Player.ts`
6. `PatrolEnemy.ts` + `WanderEnemy.ts`
7. `Renderer.ts`
8. `Game.ts` (last — depends on everything)

For each module:
- Scaffolder → solo rebuild → examiner → saboteur (optional)
- Log findings in `docs/build-log.md`

**Switch to the Extend chain** once all modules are rebuilt and you can answer Tier 2 examiner questions on each.

---

## The Extend Chain (When Ready)

1. `use the cartographer agent on` the area you're extending — confirm you understand the surrounding code.
2. Implement the new feature solo (no AI writing code).
3. `use the architect agent on` your new implementation — justify every structural decision.
4. Update `docs/build-log.md`.

---

## Quick Reference: Agent Invocations

```
use the cartographer agent on [file/module/directory]
use the examiner agent on [file/function/concept]
use the challenger agent on [file/function]
use the scaffolder agent on [file/function]
use the saboteur agent on [file]       # or: "surprise me"
use the architect agent on [module/decision]
```

---

## Session Log Template

Copy this into `docs/build-log.md` at the end of each session:

```
## [Date] — Session [N]

**Goal:** [what you intended to do]
**Phase:** [Comprehend / Re-implement / Extend]
**Modules touched:** [list]

**What I studied/built:**
-

**Key insights:**
-

**Gaps to revisit:**
-

**Next session start point:**
```

---

## Signs You're Ready to Advance Phases

**Comprehend → Re-implement:**
- Examiner Tier 2 correct on all "MUST UNDERSTAND NOW" concepts across all modules
- Challenger exercises produce no surprises (all predictions correct)

**Re-implement → Extend:**
- All modules rebuilt from scaffold; post-rebuild comparisons show no BUGs
- Saboteur sessions: bugs found without hints on first attempt

**You're never "done" with any phase** — you can always go deeper. Advance when the current phase stops producing surprises.
