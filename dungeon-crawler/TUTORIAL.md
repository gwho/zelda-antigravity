# Tutor's Guide: Building a Dungeon Crawler from Scratch

Welcome! This guide explains the architecture and design decisions behind this TypeScript dungeon crawler. It's meant for beginners seeking to understand how to build games without giant frameworks.

## 1. The Core Game Loop
At the heart of every game is the **Game Loop**. In the web browser, the best way to run a loop is using `requestAnimationFrame`. This tells the browser: "Before you paint the next frame on the screen, run this function."

In `src/Game.ts`, you'll find our `loop(currentTime)` function:
```typescript
private loop(currentTime: number) {
    let dt = (currentTime - this.lastTime) / 1000; // calculate delta-time in seconds
    this.update(dt);
    this.renderer.render(...);
    requestAnimationFrame((t) => this.loop(t));
}
```
**Delta-time (`dt`)** ensures the game runs at the same speed regardless of whether a player's monitor is 60Hz or 144Hz.

## 2. Decoupled Architecture
Instead of having a giant `Game` class that does everything, we split responsibilities into different areas (a simplified Entity-Component-System pattern). Here's how they interact:
- **Entities (`src/entities/*`)**: Dumb data containers that know *where* they are, but often not *how* they interact with the world. (e.g. `Player.ts`).
- **Input (`src/input/*`)**: `InputManager` listens to keyboard events and translates them into semantic actions like `'attack'` or `'up'` instead of raw keycodes like `'Space'` or `'ArrowUp'`.
- **Level (`src/level/*`)**: `LevelManager` stores the 2D grid of numbers (or strings) representing walls, floor, doors. It answers questions like `isSolid(x, y)`.
- **Systems (`src/systems/*`)**: Systems do the heavy lifting:
  - `CollisionSystem`: Checks if two entities overlap (AABB collision).
  - `CombatSystem`: Handles the logic for spawning attacks and destroying enemies.
- **Rendering (`src/rendering/*`)**: The `Renderer` has a single job—take the state data (player position, enemy positions, map layout) and draw it to the canvas.

## 3. Grid-Snapped vs Continuous Movement
We implemented two types of movement in this game to demonstrate different mechanics:
1. **Grid-Snapped (Player)**: When you press a key, the player immediately calculates the next tile. If the target tile is not a wall, the player's position is snapped to that exact tile grid. This feels very mechanical and precise.
2. **Continuous (Enemies)**: The `PatrolEnemy` and `WanderEnemy` use velocity multiplied by delta-time to smoothly glide across the screen pixel by pixel. When they detect a wall, they bounce.

## Ideas for Modification
Try to implement these features to deepen your understanding:
1. **Health System**: Give the player 3 hearts. Right now, one touch means instant death. You'd need to add `health` to the `Player` class, update the `CollisionSystem` to reduce health and apply invincibility frames, and update `Renderer/HUD` to draw hearts.
2. **Pathfinding Enemy**: Create a `ChaserEnemy.ts` that compares its `getGridX()` to the player's `getGridX()` and walks toward them.
3. **Animated Sprites**: Replace the colored rectangles in `Renderer.ts` with the output of `ctx.drawImage` pulling frames from a sprite sheet. Use `player.facing` to pick the correct column of sprites!

## 5. Learning from Mistakes: The Debugging Process

During the development of this game, we ran into an interesting architectural and build problem involving TypeScript Enums. Here is a breakdown of the issue and why we made the decisions we did—it's incredibly valuable for learning modern TypeScript.

### The Problem: Strict Mode Enums
Initially, we defined our game state and types using standard TypeScript enums:
```typescript
export enum Direction {
    UP = 'up',
    DOWN = 'down', // ...
}
```
When we ran `npm run build`, Vite and TypeScript's modern strict configurations (specifically the `erasableSyntaxOnly` flag, common in modern bundlers like esbuild or swc) threw errors:
> `error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.`

### The Rationale
**Why did this happen?** Modern bundlers optimize compilation by removing (erasing) TypeScript types to leave pure JavaScript. However, TypeScript `enum`s are a unique feature: they are *not* just erased. The compiler actually generates a real JavaScript runtime object to represent the enum. Vite's modern strict mode prefers that TypeScript ONLY acts as a type-checker (linting mechanism) and doesn't emit unexpected auxiliary JavaScript code.

### The Solution: `as const` Objects
Instead of disabling the strict rule and allowing the bundler to generate hidden code, we solved the problem the "modern TypeScript way". We replaced the enums with **Const Assertions**.

```typescript
// 1. Create a raw JavaScript object that is completely read-only
export const Direction = {
    UP: 'up',
    DOWN: 'down',
} as const;

// 2. Extract the literal string values into a Type
export type Direction = typeof Direction[keyof typeof Direction];
```

**Why is this better?**
1. **Safety**: `as const` tells TypeScript "this object will never mutate."
2. **Bundler Friendly**: The modern bundler sees a plain JavaScript object, which it understands perfectly without needing special TypeScript compilation steps. 
3. **Type Extraction**: The magic line `typeof Direction[keyof typeof Direction]` creates a union type (`'up' | 'down'`) automatically. Now, whenever a function asks for a `Direction`, it only accepts those exact strings, ensuring ultimate type safety without breaking build tools!

This debugging journey teaches an important lesson: in modern web development, TypeScript is increasingly used *only* for type-checking, while leaning on native JavaScript features (like standard Objects) for runtime behavior.

---

## 6. The Health System — How It Was Built

The health system replaced the original instant-death collision with a 3-heart system, invincibility frames (i-frames), and visual feedback (HUD hearts + player blink). Four files were changed, in this order.

### 6.1 `src/constants.ts` — Centralizing Game Rules

Two new constants were added:

```typescript
// src/constants.ts
export const PLAYER_MAX_HEALTH = 3;
export const INVINCIBILITY_DURATION = 1500; // ms
```

**Why constants?** Any number that controls game feel is a tunable parameter. If `PLAYER_MAX_HEALTH` were hardcoded as `3` in three different files, you'd have to hunt down every occurrence to change it. By declaring it once in `constants.ts`, every file that imports it automatically picks up the new value. This is the **single source of truth** principle.

---

### 6.2 `Player.ts` — Adding State to an Entity

Two new fields were added to the `Player` class:

```typescript
// src/entities/Player.ts
public health: number = PLAYER_MAX_HEALTH;
public invincibilityTimer: number = 0;
```

Two new methods expose and mutate that state:

```typescript
public isInvincible(): boolean {
    return this.invincibilityTimer > 0;
}

public takeDamage(): void {
    if (!this.isInvincible()) {
        this.health -= 1;
        this.invincibilityTimer = INVINCIBILITY_DURATION;
    }
}
```

And the `update(dt)` method decrements the timer each frame:

```typescript
this.invincibilityTimer = Math.max(0, this.invincibilityTimer - dt * 1000);
```

**The invincibility frames pattern**: After taking a hit, the player enters an immune window (`invincibilityTimer > 0`). During this window, `takeDamage()` returns immediately without decrementing health. Without i-frames, a single collision lasting a few frames (60 fps × 0.016s each) would drain all 3 hearts in under a second. The `Math.max(0, ...)` idiom prevents the timer from going negative, which would make `isInvincible()` incorrectly return `true` forever.

---

### 6.3 `CollisionSystem.ts` — Changing What "Collision" Means

**Before** (original): any overlap returned `true`, and `Game.ts` treated that as instant death.

**After** (health system):

```typescript
// src/systems/CollisionSystem.ts
public static checkPlayerEnemyCollisions(player: Player, enemies: Entity[]): boolean {
    for (const enemy of enemies) {
        if (this.checkOverlap(player, enemy)) {
            player.takeDamage();
            break;
        }
    }
    return player.health <= 0;
}
```

Key design lessons here:
- The method now calls `player.takeDamage()` rather than returning immediately — the entity manages its own state.
- The return value changed meaning: it no longer answers "did a collision happen?" but "is the player dead?". Callers (Game.ts) only need to know the *outcome*, not the *event*.
- The `break` after the first overlap ensures we process at most one hit per frame, even if the player somehow overlaps two enemies simultaneously.

**AABB** — Axis-Aligned Bounding Box — is the rectangle-vs-rectangle overlap test used by `checkOverlap()`. It tests whether two rectangles intersect by checking all four edges. It is cheap, simple, and effective for grid-based games.

---

### 6.4 `Renderer.ts` — Two Visual Feedback Tricks

**Heart HUD** in `renderHUD()`:

```typescript
// src/rendering/Renderer.ts — renderHUD()
for (let i = 0; i < PLAYER_MAX_HEALTH; i++) {
    this.ctx.fillStyle = i < player.health ? '#E53935' : '#555';
    this.ctx.fillText(i < player.health ? '♥' : '♡', 20 + i * 22, 27);
}
```

The loop runs `PLAYER_MAX_HEALTH` times (not a hardcoded `3`). For each slot `i`, it checks whether that slot is filled (`i < player.health`). A filled heart gets a red color and the filled `♥` character; an empty slot gets grey and the outline `♡` character. If you change `PLAYER_MAX_HEALTH` to `5`, the HUD grows automatically.

**Blink effect** in `renderPlayer()`:

```typescript
// src/rendering/Renderer.ts — renderPlayer()
this.ctx.save();
if (player.isInvincible()) {
    this.ctx.globalAlpha = Math.floor(player.invincibilityTimer / 100) % 2 === 0 ? 0.3 : 1.0;
}
// ... draw player ...
this.ctx.restore();
```

`ctx.globalAlpha` sets the opacity for everything drawn until it is reset. Dividing `invincibilityTimer` by `100` and flooring it produces an integer that increases every 100 ms. Taking `% 2` alternates between `0` and `1` — creating a visible 5 Hz blink. The opacity swings between `0.3` (nearly transparent) and `1.0` (fully opaque).

`ctx.save()` and `ctx.restore()` are critical bookkeeping. `save()` pushes the current drawing state (alpha, transforms, styles) onto a stack. `restore()` pops it back. Without these, setting `globalAlpha` for the player would leave it active for every subsequent draw call — enemies and HUD text would also blink.

---

## 7. Hands-On Exercises

Each exercise follows this format:

**Goal** — what you will achieve
**Files** — which files to edit
**Concept** — the underlying idea you are practising
**Claude Prompt** — paste this into Claude Code to get step-by-step help
**Manual Steps** — what to do yourself to verify the result

Difficulty: 🟢 Beginner  🟡 Easy  🔶 Intermediate  🔴 Advanced

---

### Exercise 1 🟢 — Change Max Health

**Goal**: Give the player 5 hearts instead of 3.

**Files**: `src/constants.ts` (1 line)

**Concept**: Constants as the single source of truth. One change automatically updates both the game logic (Player) and the visual (Renderer HUD).

**Claude Prompt**:
```
In dungeon-crawler/src/constants.ts, change PLAYER_MAX_HEALTH from 3 to 5.
Then confirm the heart drawing loop in Renderer.ts uses PLAYER_MAX_HEALTH
(not a hardcoded 3) so the HUD adjusts automatically. Explain each change.
```

**Manual Steps**:
1. Open `src/constants.ts` and set `PLAYER_MAX_HEALTH = 5`
2. Run `npm run dev`
3. Start a game — verify the HUD shows 5 hearts

---

### Exercise 2 🟢 — Change Invincibility Duration

**Goal**: Make the player invincible for a full 3 seconds after taking a hit.

**Files**: `src/constants.ts` (1 line)

**Concept**: How a single constant flows through `Player.takeDamage()`, the blink formula in `Renderer.renderPlayer()`, and `CollisionSystem.checkPlayerEnemyCollisions()` — without touching any of those files.

**Claude Prompt**:
```
In dungeon-crawler/src/constants.ts, change INVINCIBILITY_DURATION to 3000.
Explain how this value flows through Player.takeDamage(), the blink in
Renderer.renderPlayer(), and why no other files need changing.
```

**Manual Steps**:
1. Set `INVINCIBILITY_DURATION = 3000` in `src/constants.ts`
2. Run `npm run dev`, take a hit
3. Count — the blink should last 3 full seconds

---

### Exercise 3 🟢 — Change Player and Enemy Colors

**Goal**: Make the player blue (`#1565C0`) and patrol enemies orange (`#E65100`).

**Files**: `src/constants.ts` — the `COLORS` object

**Concept**: A centralised color palette. `Renderer.ts` reads all colors from `COLORS`; you never need to grep for hex values scattered through drawing code.

**Claude Prompt**:
```
In dungeon-crawler/src/constants.ts, change COLORS.PLAYER to '#1565C0' and
COLORS.PATROL_ENEMY to '#E65100'. Show me which lines in Renderer.ts consume
these colors.
```

**Manual Steps**:
1. Edit the two values in the `COLORS` object in `src/constants.ts`
2. Run `npm run dev` and verify the new colors in-game

---

### Exercise 4 🟢 — Adjust Enemy Speeds

**Goal**: Make patrol enemies faster (`4.0`) and wander enemies slower (`0.8`).

**Files**: `src/constants.ts`

**Concept**: Numeric tuning and game feel. Both enemy classes use these constants in their `move(dt)` call — understanding `dt`-based movement means you know why doubling the constant doubles the speed regardless of frame rate.

**Claude Prompt**:
```
In dungeon-crawler/src/constants.ts, change PATROL_SPEED to 4.0 and
WANDER_SPEED to 0.8. Explain how PatrolEnemy.ts and WanderEnemy.ts use
these in their move(dt) formula.
```

**Manual Steps**:
1. Edit `PATROL_SPEED` and `WANDER_SPEED` in `src/constants.ts`
2. Run `npm run dev` and feel the difficulty shift

---

### Exercise 5 🟡 — Screen Flash When Taking Damage

**Goal**: Trigger the existing red screen flash whenever the player takes a hit.

**Files**: `src/Game.ts`

**Concept**: Detecting damage by comparing health before and after a system call. The collision system modifies player health internally — callers detect the side-effect rather than needing a separate return value.

**Claude Prompt**:
```
In dungeon-crawler/src/Game.ts update(), before calling
CollisionSystem.checkPlayerEnemyCollisions(), store player.health in a local
variable called prevHealth. After the call, if player.health is lower than
prevHealth, call triggerScreenFlash(). Explain why we snapshot health before
rather than checking inside CollisionSystem.
```

**Manual Steps**:
1. In `Game.ts` `update()`, add `const prevHealth = this.player.health;` before the collision call
2. After the collision call, add:
   ```typescript
   if (this.player.health < prevHealth) {
       this.triggerScreenFlash();
   }
   ```
3. Run `npm run dev`, take a hit — the screen should flash red

---

### Exercise 6 🟡 — Show I-Frame Status in HUD

**Goal**: While the player is invincible, display `I-FRAMES` in yellow in the HUD.

**Files**: `src/rendering/Renderer.ts` — `renderHUD()` method

**Concept**: Conditional rendering using live entity state. The `renderHUD()` method already receives the `player` object, so you can call any public method on it.

**Claude Prompt**:
```
In dungeon-crawler/src/rendering/Renderer.ts renderHUD(), add a conditional:
if player.isInvincible() is true, draw the text 'I-FRAMES' in '#FFD600'
at around x=100, y=27 (just right of the hearts). Explain how renderHUD
already receives the player object.
```

**Manual Steps**:
1. In `renderHUD()`, after the heart loop, add:
   ```typescript
   if (player.isInvincible()) {
       this.ctx.fillStyle = '#FFD600';
       this.ctx.fillText('I-FRAMES', 100, 27);
   }
   ```
2. Adjust the x offset so it doesn't overlap the `Level:` text
3. Run `npm run dev`, take a hit — the label should appear and disappear with the blink

---

### Exercise 7 🔶 — Add a Fourth Level

**Goal**: Design and add a new level (Level 4) to the game.

**Files**: `src/level/levels.ts`

**Concept**: The 12×10 character grid format, spawn markers, and how `parseLevelString()` maps each character to a `TileType`. Understanding the level format means you can prototype content without touching any engine code.

**Claude Prompt**:
```
In dungeon-crawler/src/level/levels.ts, add a 4th level after the existing 3.
It should include: a winding path, 2 patrol enemies (*), 1 wander enemy (}),
a fire pot obstacle ()), and stairs ($) in the top-right corner. Before writing
the level string, explain the full character-to-tile mapping used by
parseLevelString().
```

**Manual Steps**:
1. Open `src/level/levels.ts` and study `parseLevelString()` to learn the character map
2. Sketch a 12×10 grid on paper (or in a text file)
3. Encode your layout as a template string and push a new `LevelData` entry into the `levels` array
4. Run `npm run dev`, clear Levels 1–3, and play your new level

---

### Exercise 8 🔶 — High Score Persistence

**Goal**: Save and display the player's all-time best score across page reloads using `localStorage`.

**Files**: `src/Game.ts`, `src/rendering/Renderer.ts`

**Concept**: The browser `localStorage` API persists key/value string pairs beyond page reloads. Integrating it teaches you how to thread new state through the render pipeline.

**Claude Prompt**:
```
In dungeon-crawler/src/Game.ts, when transitioning to GAME_OVER or VICTORY,
compare this.score to Number(localStorage.getItem('highScore') ?? 0) and save
the higher value with localStorage.setItem. In Renderer.ts renderOverlayMessage(),
accept a 4th optional string parameter and render it as a smaller line below the
subtitle. Pass 'Best: X' from Game.ts render() call. Explain localStorage.getItem
and setItem.
```

**Manual Steps**:
1. In `Game.ts`, add save logic inside the state transitions to `GAME_OVER` and `VICTORY`
2. Thread the `highScore` value through `render()` → `renderOverlayMessage()`
3. Add the optional 4th string to `renderOverlayMessage()` with a `ctx.fillText` call
4. Play a game, reload the page, die again — the best score should persist

---

### Exercise 9 🔴 — Pause Menu

**Goal**: Press `Escape` to pause and unpause; freeze all game logic while paused; show a `PAUSED` overlay.

**Files**: `src/types.ts`, `src/input/InputManager.ts`, `src/Game.ts`, `src/rendering/Renderer.ts`

**Concept**: Extending the state machine with a new state, adding a new input action, and using a conditional update skip — the cleanest way to freeze game logic without touching individual systems.

**Claude Prompt**:
```
Add a pause feature in 4 steps:
(1) Add 'PAUSED' to the GameState const-object in src/types.ts.
(2) Add 'pause' to the Action type in InputManager.ts and map the Escape key to it.
(3) In Game.ts update(), if state is PLAYING and 'pause' is just-pressed, set state
    to PAUSED; if PAUSED and 'pause' is just-pressed, set state to PLAYING; skip all
    other update logic while PAUSED.
(4) In Renderer.ts render(), when state is PAUSED, draw a semi-transparent black
    overlay with 'PAUSED' centered in white.
Explain each step and which file to touch.
```

**Manual Steps**:
1. Follow the 4 steps in order
2. Run `npm run build` after each step to catch type errors early
3. Test: start a game, press Escape — enemies should freeze; press again — game resumes

---

### Exercise 10 🔴 — Add a Chaser Enemy

**Goal**: A new enemy type that moves toward the player each frame using simple directional logic.

**Files**: `src/entities/ChaserEnemy.ts` (new file), `src/types.ts`, `src/level/levels.ts`, `src/Game.ts`, `src/rendering/Renderer.ts`

**Concept**: Subclassing `Entity`, basic directional pathfinding, and the full end-to-end integration of a new entity type — touching every layer of the architecture.

**Claude Prompt**:
```
Add a ChaserEnemy to the dungeon crawler in 6 steps:
(1) Create src/entities/ChaserEnemy.ts extending Entity. Its
    move(dt, level, playerX, playerY) compares grid positions and moves 1 step
    per frame toward the player horizontally (if |dx| >= |dy|) or vertically,
    at 55 px/s, checking level.isSolid() before moving.
(2) Add ENEMY_CHASER to EntityType in types.ts.
(3) Add an '@' spawn marker to parseLevelString() in levels.ts mapping to a new
    SPAWN_CHASER tile (which becomes FLOOR after spawning).
(4) In Game.ts loadLevel(), spawn ChaserEnemy on SPAWN_CHASER tiles.
(5) In Game.ts update(), call enemy.move(dt, levelManager, player.x, player.y)
    for ChaserEnemies.
(6) In Renderer.ts renderEnemies(), render ENEMY_CHASER in '#00BCD4' (cyan).
Explain each integration point.
```

**Manual Steps**:
1. Create `ChaserEnemy.ts` first and confirm it compiles (`npm run build`)
2. Follow each integration step in order, building after each
3. Add an `@` tile to the Level 2 string to test the new enemy in-game
