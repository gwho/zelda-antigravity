# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

The game lives entirely in `dungeon-crawler/`. All commands should be run from that directory.

```
dungeon-crawler/
  src/
    main.ts              # Entry point — mounts Game on canvas
    Game.ts              # Main game loop, state machine, level loading, entity spawning
    types.ts             # Shared const-object type unions (TileType, EntityType, GameState, Direction) — NOT TypeScript enums (erasableSyntaxOnly is enabled)
    constants.ts         # TILE_SIZE, grid dimensions, speeds, colors, PLAYER_MAX_HEALTH, INVINCIBILITY_DURATION
    entities/
      Entity.ts          # Abstract base class with AABB getBounds()
      Player.ts          # Grid-snapped movement, attack timer, health (3 hearts), invincibility frames (takeDamage / isInvincible)
      PatrolEnemy.ts     # Continuous movement along a patrol path
      WanderEnemy.ts     # Continuous movement with random direction changes
    systems/
      CollisionSystem.ts # Player-enemy AABB overlap → calls player.takeDamage(); returns true only when health <= 0
      CombatSystem.ts    # Attack hitbox vs. enemy overlap → kill callback
    input/
      InputManager.ts    # Keyboard → abstract actions (up/down/left/right/attack/restart)
    level/
      LevelManager.ts    # Loads/stores grid, isSolid(), getTile()/setTile()
      levels.ts          # Level definitions as string templates + parseLevelString()
    rendering/
      Renderer.ts        # All canvas 2D drawing (tiles, entities, HUD, overlays)
```

## Commands

From `dungeon-crawler/`:

```bash
npm install       # Install dependencies
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # tsc type-check + Vite production build
npm run preview   # Preview the production build
```

There are no tests.

## Architecture

**Game loop**: `Game.ts` runs a `requestAnimationFrame` loop. Each frame calls `update(dt)` then `renderer.render(...)`. The `dt` is capped at 100ms to prevent tunneling after tab switches.

**State machine**: `GameState` const-object (`MENU → PLAYING → GAME_OVER | VICTORY`). All update logic branches on this state.

**Movement model**: Player movement is grid-snapped (one tile per keypress, 150ms cooldown). Enemy movement is continuous pixel-based using `dt`. Both check `LevelManager.isSolid()` for wall collisions.

**Level format**: Levels are 12×10 grids defined as multiline strings in `levels.ts`. Each character maps to a `TileType`. Spawn markers (`*` = PatrolEnemy, `}` = WanderEnemy) are replaced with `FLOOR` tiles after spawning. `LevelData` deep-copies the grid on load so restarts work correctly.

**Combat**: `CombatSystem.processAttacks()` checks an attack hitbox (1 tile in front of the player's facing direction) against all enemy bounds. `CollisionSystem.checkPlayerEnemyCollisions()` calls `player.takeDamage()` on overlap (which respects invincibility frames) and returns `true` only when `player.health <= 0`. Game over is triggered by health depletion, not first contact.

**Level progression**: Player can only exit (step on `DOOR_LEFT`, `DOOR_TOP`, or `STAIRS` tiles) when `enemies.length === 0`. Otherwise a red screen flash and push-back occur via CSS classes on `#game-container`.

**Adding a level**: Append a new string template + `LevelData` entry to the `levels` array in `src/level/levels.ts`.

## Documentation

- `dungeon-crawler/TUTORIAL.md` — Architecture walkthrough, design pattern explanations, debugging case studies (enum → const migration), and 10 hands-on exercises.
- `dungeon-crawler/PLANS.md` — Detailed implementation plans for features 1B–1E (collectibles, boss enemy, chaser enemy, new levels).
- `dungeon-crawler/ROADMAP.md` — High-level feature roadmap.
- `dungeon-crawler/learning-strategy-guide.md` — Phased learning strategy (Orient → Read → Trace → Patterns → Implement) with copy-paste Claude prompts for each phase.
- `ai-native-developer-learning-plan.md` — Full G→C→R (Generate → Comprehend → Re-implement) framework with custom subagent templates, worktree workflow, and a week-by-week study plan.

## Learning Mode

**Current Phase:** Comprehend

This project follows the G→C→R (Generate → Comprehend → Re-implement) learning framework.
All agents must read this section and adapt their behaviour to the current phase:

- **Generate** — Agent builds working code from specification. Do not explain implementation
  details unprompted; the learner will study the code in Comprehend phase.
- **Comprehend** — Agent explains, traces, and tests understanding. Never write new code;
  redirect all "can you implement X" requests to "let's understand how the existing code
  works first."
- **Re-implement** — Agent answers conceptual questions only. Never produce implementation
  code. If asked to write code, respond: "You're in Re-implement phase — that's your job.
  Tell me what you're trying to do and I'll ask you a question to point you in the right direction."
- **Extend** — Agent may write new code for new features, but must first confirm the learner
  can explain the area they're modifying.

Change `Current Phase` to `Generate`, `Comprehend`, `Re-implement`, or `Extend` as you
progress. Agents will adapt automatically.

**Learning support files** (created as needed):
- `docs/comprehension-notes.md` — annotations and questions written during Comprehend phase
- `docs/build-log.md` — session summaries (date, what was studied/built, key insights)
- `docs/scaffold-[module].md` — scaffolder output for each module being rebuilt
