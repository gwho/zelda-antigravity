# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

The game lives entirely in `dungeon-crawler/`. All commands should be run from that directory.

```
dungeon-crawler/
  src/
    main.ts              # Entry point — mounts Game on canvas
    Game.ts              # Main game loop, state machine, level loading, entity spawning
    types.ts             # Shared enums (TileType, EntityType, GameState, Direction)
    constants.ts         # TILE_SIZE, grid dimensions, speeds, colors
    entities/
      Entity.ts          # Abstract base class with AABB getBounds()
      Player.ts          # Grid-snapped movement, attack timer logic
      PatrolEnemy.ts     # Continuous movement along a patrol path
      WanderEnemy.ts     # Continuous movement with random direction changes
    systems/
      CollisionSystem.ts # Player-enemy AABB overlap → game over
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

**State machine**: `GameState` enum (`MENU → PLAYING → GAME_OVER | VICTORY`). All update logic branches on this state.

**Movement model**: Player movement is grid-snapped (one tile per keypress, 150ms cooldown). Enemy movement is continuous pixel-based using `dt`. Both check `LevelManager.isSolid()` for wall collisions.

**Level format**: Levels are 12×10 grids defined as multiline strings in `levels.ts`. Each character maps to a `TileType`. Spawn markers (`*` = PatrolEnemy, `}` = WanderEnemy) are replaced with `FLOOR` tiles after spawning. `LevelData` deep-copies the grid on load so restarts work correctly.

**Combat**: `CombatSystem.processAttacks()` checks an attack hitbox (1 tile in front of the player's facing direction) against all enemy bounds. `CollisionSystem.checkPlayerEnemyCollisions()` checks AABB overlap between the player and any enemy — instant game over on contact.

**Level progression**: Player can only exit (step on `DOOR_LEFT`, `DOOR_TOP`, or `STAIRS` tiles) when `enemies.length === 0`. Otherwise a red screen flash and push-back occur via CSS classes on `#game-container`.

**Adding a level**: Append a new string template + `LevelData` entry to the `levels` array in `src/level/levels.ts`.
