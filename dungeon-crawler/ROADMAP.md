# Dungeon Crawler — Future Improvement Roadmap

This file tracks planned improvements beyond the initial health system (Priority 1A, completed).

---

## Priority 1 — Core Gameplay

### 1B: Collectible Items (Hearts / Score Pickups)
- Add `TileType.HEART_PICKUP` and `TileType.COIN`
- Render as sprites on floor tiles
- On player step: heal 1 HP (capped at `PLAYER_MAX_HEALTH`) or add score bonus
- `LevelManager.setTile(x, y, TileType.FLOOR)` to consume pickup

### 1C: Boss Enemy
- New `BossEnemy.ts` extending `Entity`
- Larger sprite (2×2 tiles), higher HP counter (e.g. 3 hits to kill)
- Charges toward player when in line-of-sight, pauses otherwise
- `CombatSystem` already supports multi-hit via a `health` field on enemies — add `health` to `Entity` base or a `Boss`-specific field
- Dedicated boss level (last entry in `levels.ts`)

### 1D: Chaser Enemy
- New `ChaserEnemy.ts` — A* or simple Manhattan-distance pathfinding toward player each frame
- Slower speed than patrol to compensate for intelligence
- Spawn marker: e.g. `@` in level strings

### 1E: More Levels
- Add levels 4–8 to `src/level/levels.ts`
- Introduce locked doors (new `TileType.DOOR_LOCKED`) that require a key pickup

---

## Priority 2 — Visuals & Audio

### 2A: Sprite Sheets
- Replace colored rectangles with `drawImage` from a sprite sheet PNG
- Animate player walk (2-frame cycle per direction) using `attackAnimationTimer` parity

### 2B: Sound Effects
- Web Audio API: short oscillator bursts for attack, damage, pickup, death
- No external assets needed — procedural synthesis

### 2C: Screen Shake on Damage
- Extend existing CSS `shake` class trigger to player-damage events (currently only fires on blocked exit)
- Call `triggerScreenFlash()` from `Game.ts` when `player.takeDamage()` fires (hook via return value or event)

### 2D: Enemy Death Particles
- On enemy kill callback in `Game.ts`, push a list of short-lived particle objects
- `Renderer.renderParticles()` draws fading squares expanding from kill position

---

## Priority 3 — Controls & UX

### 3A: Mobile Touch Controls
- Render D-pad overlay on canvas for touch devices
- Map `touchstart`/`touchend` to the same abstract actions in `InputManager`

### 3B: Pause Menu
- Add `GameState.PAUSED`
- `Escape` key toggles pause; render semi-transparent overlay with resume/restart options

### 3C: High Score Persistence
- `localStorage.setItem('highScore', score)` on game over if score exceeds stored value
- Display in HUD and on menu screen

---

## Priority 4 — Architecture

### 4A: Event Bus
- Replace direct `Game.ts` callbacks with a lightweight `EventEmitter`
- Decouple `CombatSystem` enemy-kill notification from `Game.ts` internals

### 4B: Entity Component System (ECS) Lite
- Extract `health`, `velocity`, `patrol path` into reusable components
- Reduces duplication between `PatrolEnemy` / `WanderEnemy` / future enemy types

### 4C: Tiled Map Editor Support
- Export `.tmj` JSON from Tiled; write a `parseTiledMap()` loader alongside `parseLevelString()`
- Allows richer level design without editing raw string templates

---

## Priority 5 — Infrastructure

### 5A: Automated Tests
- Vitest unit tests for `CollisionSystem`, `CombatSystem`, `LevelManager.isSolid()`
- No DOM required — pure logic functions are easily testable

### 5B: CI Pipeline
- GitHub Actions: `npm run build` on every PR
- Add `npm test` once 5A is implemented

### 5C: Asset Pipeline
- `vite-plugin-imagemin` for sprite sheet compression
- Preload assets in `Game` constructor before starting the loop
