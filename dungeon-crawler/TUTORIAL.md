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
