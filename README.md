# Zelda Antigravity

A top-down, grid-based dungeon crawler built purely with **TypeScript** and **HTML5 Canvas**. Inspired by classic Zelda-style games, it runs entirely in the browser with no external game-engine dependencies.

---

## Repository Structure

```
zelda-antigravity/
└── dungeon-crawler/   # Main game application (TypeScript + Vite)
    ├── src/
    │   ├── entities/      # Player, PatrolEnemy, WanderEnemy, base Entity
    │   ├── input/         # InputManager – keyboard → semantic actions
    │   ├── level/         # LevelManager, level data (3 levels)
    │   ├── rendering/     # Renderer – draws everything to the canvas
    │   ├── systems/       # CollisionSystem, CombatSystem
    │   ├── constants.ts   # Tile size, grid dims, speeds, colours
    │   ├── types.ts       # Shared const-assertion types (Direction, TileType, GameState…)
    │   ├── Game.ts        # Top-level orchestrator, game loop
    │   └── main.ts        # Entry point – wires Canvas → Game
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## Architecture

### Game Loop
The browser's `requestAnimationFrame` drives a `loop(currentTime)` method inside `Game.ts`. Each frame computes **delta-time** (`dt`) so the game speed is monitor-refresh-rate independent:

```typescript
private loop(currentTime: number) {
    let dt = (currentTime - this.lastTime) / 1000; // seconds
    if (dt > 0.1) dt = 0.1;   // cap to avoid tunnelling after tab switch
    this.update(dt);
    this.renderer.render(/* … */);
    requestAnimationFrame((t) => this.loop(t));
}
```

### Entity-Component-System (ECS-style) Pattern
Rather than one monolithic class, responsibilities are split into focused modules:

| Module | Responsibility |
|---|---|
| **Entities** (`src/entities/`) | Data containers for position, size, facing, speed. `Player`, `PatrolEnemy`, `WanderEnemy` all extend `Entity`. |
| **Input** (`src/input/InputManager`) | Listens to `keydown`/`keyup` and exposes semantic actions (`'up'`, `'attack'`, `'restart'`) instead of raw key codes. |
| **Level** (`src/level/LevelManager`) | Stores the 12-column × 10-row tile grid, answers `isSolid(x, y)`, and exposes player-spawn coordinates. |
| **Systems** (`src/systems/`) | `CollisionSystem` (AABB overlap checks), `CombatSystem` (attack spawning / enemy removal). |
| **Renderer** (`src/rendering/Renderer`) | Single-responsibility: reads game state and draws tiles, entities, HUD, and overlay screens to the canvas. |
| **Game** (`src/Game.ts`) | Orchestrator – owns all the above, runs the loop, and mediates state transitions (MENU → PLAYING → GAME_OVER / VICTORY). |

### Movement: Grid-Snapped vs. Continuous
Two deliberate movement models are used to contrast game-feel:

- **Player (grid-snapped)**: On each key-press the target tile is computed. If the tile is walkable the player teleports to it, giving a crisp Zelda-like feel.
- **Enemies (continuous)**: `PatrolEnemy` and `WanderEnemy` use velocity × `dt` for smooth pixel-by-pixel movement, bouncing when they hit a wall.

### Tile System
Levels are authored as plain strings and parsed into a 2-D `TileType[][]` grid. Special tile characters encode walls, corners, doors, stairs, decorations (`(` / `)`), and enemy-spawn markers (`*` patrol, `}` wander).

### Game States
```
MENU ──(Space)──► PLAYING ──(all enemies dead + exit)──► next level
                      │
                      ├──(enemy touch)──► GAME_OVER ──(Space or R)──► MENU
                      │
                      └──(last level cleared)──► VICTORY ──(Space or R)──► MENU
```

### Build Tooling Note
TypeScript `enum`s are replaced with `as const` objects + derived union types throughout the codebase. This is required by Vite/esbuild's `erasableSyntaxOnly` strict mode, which expects TypeScript to act only as a type-checker and not emit auxiliary runtime objects.

---

## Prerequisites
- [Node.js](https://nodejs.org/) v16+
- npm

## Setup & Run

```bash
cd dungeon-crawler
npm install
npm run dev
# Open http://localhost:5173
```

## Controls

| Key | Action |
|---|---|
| Arrow Keys / WASD | Move player (grid-snapped) |
| Space | Attack in facing direction; also restarts from Game Over / Victory |
| R | Restart from Game Over / Victory screen |

Defeat **all enemies** in a room to unlock the doors and advance to the next level.

---

## To-Do / Future Improvements

### Gameplay
- [ ] **Health system** – Give the player 3 hearts with invincibility frames instead of instant death on enemy contact.
- [ ] **Item pickups** – Keys, health potions, and score multipliers dropped by defeated enemies.
- [ ] **Boss enemy** – A larger, multi-phase enemy at the end of the final level.
- [ ] **Chaser enemy** – A `ChaserEnemy` that pathfinds toward the player using a simple grid BFS/A* algorithm.
- [ ] **More levels** – Expand beyond 3 levels; add a level-select or procedural generation.

### Visuals & Audio
- [ ] **Animated sprites** – Replace coloured rectangles with sprite-sheet frames, using `player.facing` to select the correct animation column.
- [ ] **Sound effects** – Attack, footsteps, enemy death, and door-unlock sounds via the Web Audio API.
- [ ] **Background music** – Looping chiptune track during gameplay.
- [ ] **Particle effects** – Dust on movement, sparks on attack impact.

### Controls & Accessibility
- [ ] **Mobile / touch controls** – On-screen D-pad and attack button for phone browsers.
- [ ] **Gamepad support** – Map the Gamepad API to existing `InputManager` actions.

### Architecture & Code Quality
- [ ] **Proper ECS** – Migrate to a data-driven component/system model to make adding new entity types easier.
- [ ] **Scene manager** – Extract menu, game, and game-over screens into dedicated Scene classes.
- [ ] **Unit tests** – Add Vitest tests for `CollisionSystem`, `LevelManager`, and `InputManager`.
- [ ] **Save / high-score** – Persist the best score to `localStorage`.

### Infrastructure
- [ ] **CI/CD pipeline** – Add a GitHub Actions workflow to build and optionally deploy to GitHub Pages on every push.
- [ ] **Linting** – Integrate ESLint with a TypeScript ruleset.

