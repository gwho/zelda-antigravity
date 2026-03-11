# Learning Strategy Guide

How to use Claude Code as a tutor — not a code generator — to deeply understand
this project before writing a single line of code yourself.

Three principles run through every section of this guide:

- **Analogy-first**: a concrete real-world picture before any technical vocabulary
- **Gotcha-first**: the counterintuitive thing is flagged *before* you read the code, not after
- **Socratic**: every explanation stops one step short and asks you to predict the next layer — write your prediction down, then verify it

---

## The Core Mindset Shift

By default, people use Claude Code to *produce* output.
In learning mode, you use it to *explain* things you could read yourself but don't
yet fully understand. The difference is in how you phrase every prompt:

| Code-generation mode | Learning mode |
|----------------------|---------------|
| "Add a pause feature" | "Explain how the game state machine works and where I would need to hook in a new state" |
| "Fix the collision bug" | "Walk me through exactly what happens, line by line, when the player walks into an enemy" |
| "Create a new enemy type" | "Explain what methods a new enemy class must implement and why, based on how PatrolEnemy.ts works" |

The rule: **never ask Claude to write or change code until you can predict what it will write.**

---

## The Analogy You Need Before Reading Anything

The entire game loop is a restaurant kitchen running the same service cycle every 16ms:

1. **Take new orders** — `InputManager` reads which keys are held or just pressed
2. **Cook the food** — `update(dt)`: move entities, check collisions, apply damage, advance timers
3. **Plate and serve** — `renderer.render(...)`: draw the current state to the canvas
4. **Clear the order tickets** — `input.update()`: reset the "just pressed" state so old orders don't carry over

Same four steps, every frame, forever. Every file in this project belongs to one of these four stations. Keep this picture in your head as you read.

> ⚠ **First gotcha — find it now, before Phase 1**: Open `src/Game.ts` and find where `input.update()` is called in the frame loop. Is it at the top of the loop (before taking orders) or at the bottom (after serving)? Form a hypothesis about *why* it must be there and not at the top. Write it down. You will verify it in Phase 3.

---

## Phase 1 — Orient (30–60 min, no code)

Goal: build a mental map of the project before reading any file in depth.

### Step 1 — Read the architecture overview
Start with `TUTORIAL.md` Sections 1–2. They explain the game loop and the
decoupled architecture (entities / input / level / systems / rendering) in plain
language. Read them fully before opening any source file.

### Step 2 — Ask Claude for a guided tour
Open a Claude Code session and say:

```
Without changing anything, give me a guided tour of this dungeon crawler codebase.
Start at the entry point (src/main.ts), then trace a single frame of the game loop
through Game.ts, showing me which systems and files are touched in what order.
Don't explain every line — just the call graph.
```

Read the response. Then ask:

```
Now show me the same frame, but for the case where the player presses the attack
key and hits an enemy. Which files are involved and in what order?
```

You now understand the execution flow without having written anything.

### Step 3 — Sketch the architecture from memory
Close Claude Code. On paper, draw boxes for each directory in `src/` and arrows for
the dependencies you just learned. If you can't draw it from memory, go back to Step 2.

---

## Phase 2 — Read Every File Once (1–2 hours)

Read the files in this order. Each builds on the last.

### Foundation layer (read first)
1. `src/types.ts` — all the `as const` const-objects (`GameState`, `TileType`, `EntityType`, `Direction`) and two interfaces (`Position`, `Size`). These are the vocabulary the rest of the code uses. Note: these are **not** TypeScript enums — see `TUTORIAL.md` Section 5 for why.
2. `src/constants.ts` — all tunable numbers. Note which constants affect which systems.

### Entity layer
3. `src/entities/Entity.ts` — the base class. Understand `getBounds()` and `isActive`.
4. `src/entities/Player.ts` — grid-snapped movement, attack timer, health/i-frames.
5. `src/entities/PatrolEnemy.ts` — continuous movement, path following.
6. `src/entities/WanderEnemy.ts` — random direction changes.

### World layer
7. `src/level/levels.ts` — the character-to-tile map in `parseLevelString()`.
8. `src/level/LevelManager.ts` — `isSolid()`, `getTile()`, `setTile()`.

### System layer

> ⚠ **Gotcha before reading `CollisionSystem.ts`**: the method `checkPlayerEnemyCollisions()` returns a `boolean`. Before opening the file, predict: does that boolean mean *"did a collision happen?"* or *"is the player now dead?"*? These are different questions. Write your answer, then read the file.

9. `src/systems/CollisionSystem.ts` — AABB overlap, damage vs. instant death.
10. `src/systems/CombatSystem.ts` — attack hitbox vs. enemy bounds.

### Input & rendering

> ⚠ **Gotcha before reading `InputManager.ts`**: the manager distinguishes between `isDown()` (key is currently held) and `isJustPressed()` (key was pressed this frame). Before reading, predict: why does the game need both? What would break if you only had `isDown()`? Write your answer.

11. `src/input/InputManager.ts` — keyboard events → semantic actions.
12. `src/rendering/Renderer.ts` — one method per thing drawn; read in call order.

### Orchestration (read last)
13. `src/Game.ts` — the state machine and update loop. Makes the most sense after
    you understand everything it calls.

### For each file, ask Claude:
```
I just read [filename]. Explain the one design decision in this file that would
be least obvious to a beginner, and why the author made that choice.
```

---

## Phase 3 — Trace Specific Scenarios (1 hour)

**The rule for this phase**: write your prediction *before* reading the code. Be wrong on purpose. The correction is where learning happens.

For each scenario, after writing your prediction, use this Claude prompt to verify:
```
I traced [scenario]. My prediction was: [your answer].
Is this correct? Show me the exact lines that confirm or correct it,
and explain what I misunderstood.
```

---

### Scenario A — Player takes damage

**The analogy**: a boxer with a brief post-punch stagger where they can't be hit again. The stagger window is the invincibility frame.

**Predict before reading**:
- What field on `Player` holds the "stagger" timer?
- How does `CollisionSystem` check whether the stagger is active before applying damage?
- After taking damage, how does `Renderer` visually signal the stagger to the player?
- In `update(dt)`, what prevents the timer from going negative?

Write your four answers, then open `Player.ts`, `CollisionSystem.ts`, and `Renderer.ts` to verify.

**After verifying, answer this**: why does `checkPlayerEnemyCollisions()` `break` after the first overlapping enemy instead of looping through all of them?

---

### Scenario B — Enemy is killed

**The analogy**: a referee removing a player from the field. The referee doesn't decide the game rules — they just enforce the outcome when the rules say so.

**Predict before reading**:
- Where is the `handleKill` callback defined? In `CombatSystem`? In `Game.ts`? Somewhere else?
- What does it actually do to the enemies array?
- `enemies.length === 0` gates the door/stairs exit. Who checks this condition — `Game.ts`, `LevelManager`, or `Renderer`?

Write your three answers, then trace from `CombatSystem.processAttacks()` through `Game.ts` to verify.

---

### Scenario C — Level loads

**The analogy**: a blueprint that gets photocopied before construction begins. You build from the copy, not the original — so you can tear it down and build again from the same blueprint.

> ⚠ **Gotcha**: what happens to the blueprint (original grid) if you build from it directly instead of photocopying? Which method in `LevelManager` does the photocopying, and what JavaScript operation does it use?

**Predict before reading**:
- Where are spawn markers (`*`, `}`) removed from the grid? In `parseLevelString()`? In `LevelManager.loadLevel()`? In `Game.ts`?
- What tile type replaces them?
- If the grid were *not* deep-copied, what specific bug would appear the second time you played a level?

Write your three answers, then trace `loadLevel()` through `Game.ts` and `LevelManager.ts` to verify.

---

### Scenario D — Player moves into a wall

**The analogy**: asking a bouncer "can I go here?" before every step. The bouncer checks the list and answers yes or no. You only move if the answer is no.

> ⚠ **Gotcha**: in `Player.handleInput()`, movement uses `Math.round(this.x / TILE_SIZE)` to get the current grid position. But `getGridX()` uses `Math.floor(this.x / TILE_SIZE)`. They are not the same function. Before reading, predict: why does movement use `round` but the getter uses `floor`? What visual artifact would appear if both used `floor`?

**Predict before reading**:
- Which method is the "bouncer"? What arguments does it take?
- If `isSolid()` returns `true`, where does movement stop — before `this.x` is updated, or after?
- Which tile types does `isSolid()` return `true` for?

Write your three answers, then trace from `Player.handleInput()` into `LevelManager.isSolid()` to verify.

---

### Scenario E — The `input.update()` ordering puzzle (revisit your Phase 1 hypothesis)

You formed a hypothesis about `input.update()` placement at the start of this guide.
Now verify it.

**The analogy**: a notepad where a waiter writes down orders. `isJustPressed()` reads the notepad. `update()` erases it. If you erase it before the cook reads it, the order is lost. You must erase only after the order has been fully acted on.

**The question**: trace a single frame where the player presses Space (attack). At what exact point in the frame loop does `isJustPressed('attack')` return `true`? At what exact point does it return `false`? Was your original hypothesis correct?

```
In src/Game.ts, trace a single frame where Space is pressed.
Show me exactly when isJustPressed('attack') returns true versus false,
and explain why input.update() must be called after render() and not before
player.handleInput(). What specific bug appears if you move input.update() to
the top of the loop?
```

---

## Phase 4 — Understand the Design Patterns (30 min)

Each pattern gets an analogy, then a gotcha, then a prediction prompt. Do not skip to the Claude prompt — the prediction is the exercise.

---

### Pattern 1 — Delta-time movement

**The analogy**: a car's trip odometer. Whether you check it every second or every millisecond, `speed × elapsed_time = distance_traveled` gives you the same total at the end. Multiply by the interval and frame rate doesn't matter.

**The gotcha**: `PATROL_SPEED` and `WANDER_SPEED` in `constants.ts` look like they're in pixels-per-second. But are they? Before reading `PatrolEnemy.ts`, predict: if `PATROL_SPEED = 2.0` and `dt = 0.016` (one 60fps frame), how many pixels does the enemy move per frame? Does that seem right for a 48px tile?

**Predict then verify**:
```
In PatrolEnemy.ts, show me the exact line that uses dt and explain why
removing dt from the formula would break the game on a 144Hz monitor.
Then tell me whether PATROL_SPEED = 2.0 means 2 pixels/second or 2 tiles/second,
and show me the math.
```

---

### Pattern 2 — Grid coordinates vs. pixel coordinates

**The analogy**: street addresses vs. GPS coordinates. "12 Oak Street" is discrete and human-readable (grid). GPS lat/long is continuous and precise (pixels). The level is stored as a street map; entities move using GPS. You constantly convert between them.

**The gotcha**: two different conversion formulas exist in the codebase — `Math.floor(x / TILE_SIZE)` and `Math.round(x / TILE_SIZE)`. They are not interchangeable. Before looking, predict: which one would you use to ask "which tile is the player standing in?" versus "which tile should the player snap to after a keystroke?"

**Predict then verify**:
```
In Player.ts, find every place that converts between pixel and grid coordinates.
For each one, explain why Math.floor or Math.round was chosen — not Math.ceil —
and describe the visual glitch that would appear if the wrong one were used.
```

---

### Pattern 3 — State machine

**The analogy**: a traffic light. It can only be in one state at a time (RED, YELLOW, GREEN). It transitions on specific triggers. You cannot be RED and GREEN simultaneously. The game is the same: `MENU → PLAYING → GAME_OVER | VICTORY`. No two states are ever active at once.

**The gotcha**: nothing in the code *enforces* that only one state is active — it is entirely enforced by convention. Every `if (gameState === GameState.PLAYING)` branch is a manual guard. Before reading, predict: what would happen at runtime if you accidentally set `gameState` to a value not in the `GameState` const-object (e.g., a typo `'playin'`)? Would TypeScript catch it at compile time or would it silently fail?

**Predict then verify**:
```
In Game.ts, show me every place where GameState is read or written.
Then explain: if I wanted to add a PAUSED state, exactly which of those
locations would need a new branch, and which could be left unchanged?
Don't write any code — just tell me the locations and why.
```

---

### Pattern 4 — Single source of truth (constants)

**The analogy**: a company policy handbook. Every team follows the same handbook. If the policy changes, it changes in one place — you don't hand-deliver a memo to every team. `constants.ts` is the handbook; every file that imports from it gets the update automatically.

**The gotcha**: the heart HUD in `Renderer.ts` draws hearts using `PLAYER_MAX_HEALTH` in a loop. Before reading, predict: if the constant were hardcoded as `3` directly in `Renderer.ts`, what specific bug would appear if someone changed the constant in `constants.ts` to `5` and forgot to update the renderer?

**Predict then verify**:
```
In Renderer.ts renderHUD(), show me the exact loop that draws hearts.
Confirm whether it uses PLAYER_MAX_HEALTH or a hardcoded number.
Then explain: if I change PLAYER_MAX_HEALTH to 5, which files need to change
and which update automatically? Name every file.
```

---

### Pattern 5 — `ctx.save()` / `ctx.restore()`

**The analogy**: a painter's tape. Before painting a tricky section, you tape off the edges so overspray doesn't ruin adjacent areas. When you're done, you peel the tape. `save()` is laying the tape; `restore()` is peeling it.

**The gotcha**: `ctx.globalAlpha` is set inside `renderPlayer()` to create the invincibility blink. Before reading, predict: if `ctx.save()` and `ctx.restore()` were removed from `renderPlayer()`, what would the blink do to the enemy sprites and HUD text drawn in the same frame?

**Predict then verify**:
```
In Renderer.ts renderPlayer(), explain exactly what ctx.save() and ctx.restore()
protect against. Then show me one other place in Renderer.ts that uses the same
save/restore pattern and explain why it's needed there too.
```

---

## Phase 5 — Predict Before You Implement

Before writing any feature, answer these questions in writing:

1. **Which files will I need to change?** List them.
2. **For each file, which method(s) will I modify or add?**
3. **What new data (fields, constants, tile types) does this feature need?**
4. **What is the smallest possible change that proves the feature works?**

Then ask Claude:
```
I want to implement [feature]. Before writing any code, I predict I need to change
[your list of files and methods]. Is my analysis correct? What did I miss?
```

Only start coding after Claude confirms your prediction is substantially correct.

---

## Useful Learning Prompts (Copy-Paste Ready)

```
Explain [file/method] to me as if I'm a junior developer who understands
JavaScript but has never written a game before.
```

```
What is the single most important thing to understand about [file] before
I try to modify it?
```

```
I think [your hypothesis about how something works]. Is that correct?
Show me the exact lines that prove or disprove it.
```

```
Walk me through the execution of [specific action] step by step, naming
the exact file and line number at each step.
```

```
What are the three most common mistakes a beginner would make when extending
[class/system], and why?
```

```
Without writing any code, explain what a correct implementation of [feature]
would look like, which existing patterns it should follow, and what could go wrong.
```

---

## What "Ready to Code" Looks Like

You are ready to write your first feature when you can answer all of these
without looking anything up:

- [ ] What is the difference between `TILE_SIZE * 0.8` and `TILE_SIZE`? Why does the player use the smaller size?
- [ ] Why does `CollisionSystem.checkPlayerEnemyCollisions()` `break` after the first overlap instead of continuing the loop?
- [ ] What happens if you add a new `TileType` value but forget to add it to `isSolid()`?
- [ ] Where exactly does the game transition from `PLAYING` to `GAME_OVER`?
- [ ] What is `ctx.save()` and `ctx.restore()` for? What breaks if you remove them from `renderPlayer()`?
- [ ] Why does `LevelManager` deep-copy the grid on `loadLevel()`? What bug would appear without it?
- [ ] Why is `input.update()` called after `renderer.render()` and not before `player.handleInput()`?

If you can answer all seven, you understand this codebase well enough to extend it
safely. Start with Exercise 1 from `TUTORIAL.md` Section 7 (change one constant,
verify one visual change) to confirm your mental model matches reality.
