# Priority 1 Implementation Plans (1B–1E)

This file contains detailed implementation plans for the next four features on the roadmap. Each plan follows the same format used for Plan 1A (Health System): a list of files, exact changes per file, and the rationale.

---

## Plan 1B — Collectible Items (Hearts & Coins)

**Goal**: Place heart pickups and coins on the map. Walking over a heart restores 1 HP (capped at max). Walking over a coin adds to the score. Both disappear when collected.

### Files to Change

#### `src/types.ts`
- Add `HEART_PICKUP` and `COIN` to the `TileType` const-object
- Add character mappings `'h'` (heart) and `'c'` (coin) inside `parseLevelString()`

```typescript
// TileType additions
HEART_PICKUP: 'heart_pickup',
COIN: 'coin',

// parseLevelString() switch additions
case 'h': tile = TileType.HEART_PICKUP; break;
case 'c': tile = TileType.COIN; break;
```

Avoid reusing `'$'` (already stairs) or `'@'` (reserved for ChaserEnemy in Plan 1D).

#### `src/constants.ts`
- Add `COIN_SCORE_VALUE = 50`

```typescript
export const COIN_SCORE_VALUE = 50;
```

#### `src/level/levels.ts`
- Place `'h'` and `'c'` characters in level string templates where pickups should appear
- Recommended: add 1–2 hearts and 3–4 coins per level to make collection meaningful

#### `src/Game.ts`
- Add a private `checkPickups()` method called inside `update()` after `player.handleInput()`

```typescript
private checkPickups(): void {
    const gx = this.player.getGridX();
    const gy = this.player.getGridY();
    const tile = this.levelManager.getTile(gx, gy);

    if (tile === TileType.HEART_PICKUP) {
        this.player.health = Math.min(this.player.health + 1, PLAYER_MAX_HEALTH);
        this.levelManager.setTile(gx, gy, TileType.FLOOR);
    } else if (tile === TileType.COIN) {
        this.score += COIN_SCORE_VALUE;
        this.levelManager.setTile(gx, gy, TileType.FLOOR);
    }
}
```

Call site in `update()`:
```typescript
this.player.handleInput(this.input, this.levelManager);
this.checkPickups(); // <- add this line
```

#### `src/rendering/Renderer.ts`
- Add two cases to `drawTile()` for the new tile types

```typescript
case TileType.HEART_PICKUP:
    this.ctx.fillStyle = '#E53935';
    this.ctx.font = `${TILE_SIZE * 0.6}px Courier New`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('♥', px + TILE_SIZE / 2, py + TILE_SIZE * 0.7);
    break;

case TileType.COIN:
    this.ctx.fillStyle = '#FFD600';
    this.ctx.beginPath();
    this.ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
    break;
```

### LevelManager note
`isSolid()` must return `false` for `HEART_PICKUP` and `COIN` — players must be able to walk on them. Confirm these tile types are not in the `isSolid` block list (they won't be unless explicitly added).

---

## Plan 1C — Boss Enemy

**Goal**: A large, high-health enemy that charges toward the player when line-of-sight is clear. Appears on a final boss level. Awards bonus score on death.

### Files to Change

#### `src/constants.ts`
- Add `BOSS_SPEED = 120` (pixels per second; faster than patrol for threat)
- Add `BOSS_SCORE_VALUE = 500`

```typescript
export const BOSS_SPEED = 120;
export const BOSS_SCORE_VALUE = 500;
```

#### `src/types.ts`
- Add `ENEMY_BOSS` to `EntityType`
- Handle `'B'` spawn marker directly in `parseLevelString()` — replace tile with `FLOOR` after spawning (same pattern as existing spawn markers)

```typescript
// EntityType addition
ENEMY_BOSS: 'enemy_boss',
```

#### `src/entities/BossEnemy.ts` (new file)

```typescript
import { Entity } from './Entity';
import { EntityType } from '../types';
import { TILE_SIZE, BOSS_SPEED } from '../constants';
import { LevelManager } from '../level/LevelManager';

export class BossEnemy extends Entity {
    public health: number = 3;

    constructor(x: number, y: number) {
        super('boss', EntityType.ENEMY_BOSS, x, y, TILE_SIZE * 1.8, TILE_SIZE * 1.8);
    }

    public takeDamage(): void {
        this.health -= 1;
    }

    public isAlive(): boolean {
        return this.health > 0;
    }

    public move(dt: number, level: LevelManager, playerX: number, playerY: number): void {
        const myGridX = Math.floor(this.x / TILE_SIZE);
        const myGridY = Math.floor(this.y / TILE_SIZE);
        const playerGridX = Math.floor(playerX / TILE_SIZE);
        const playerGridY = Math.floor(playerY / TILE_SIZE);

        // Charge only when sharing a row or column (simple line-of-sight)
        if (myGridX === playerGridX || myGridY === playerGridY) {
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 1) {
                const nx = dx / dist;
                const ny = dy / dist;
                const nextX = this.x + nx * BOSS_SPEED * dt;
                const nextY = this.y + ny * BOSS_SPEED * dt;
                const nextGridX = Math.floor(nextX / TILE_SIZE);
                const nextGridY = Math.floor(nextY / TILE_SIZE);
                if (!level.isSolid(nextGridX, nextGridY)) {
                    this.x = nextX;
                    this.y = nextY;
                }
            }
        }
    }
}
```

#### `src/systems/CombatSystem.ts`
- Update `processAttacks()` to call `enemy.takeDamage()` via type guard when the enemy supports it
- Only call the kill callback when `isAlive()` returns `false`

```typescript
// Inside processAttacks() hit block — replace direct kill with:
if ('takeDamage' in enemy && typeof (enemy as any).takeDamage === 'function') {
    (enemy as any).takeDamage();
    if ('isAlive' in enemy && !(enemy as any).isAlive()) {
        handleKill(enemy);
    }
} else {
    // Original instant-kill for patrol/wander enemies
    handleKill(enemy);
}
```

#### `src/Game.ts`
- In `loadLevel()`, spawn `BossEnemy` when the `'B'` marker tile is encountered
- In `update()`, call `enemy.move(dt, levelManager, player.x, player.y)` for boss enemies (check `enemy.type === EntityType.ENEMY_BOSS`)
- Add `BOSS_SCORE_VALUE` to `score` in the kill callback

#### `src/rendering/Renderer.ts`
- In `renderEnemies()`, add a branch for `EntityType.ENEMY_BOSS`:

```typescript
if (enemy.type === EntityType.ENEMY_BOSS) {
    // Dark red body
    this.ctx.fillStyle = '#B71C1C';
    this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    // Crown symbol centered
    this.ctx.fillStyle = '#FFD600';
    this.ctx.font = `${TILE_SIZE}px Courier New`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('♛', enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 + 12);
    // Health bar below sprite
    const boss = enemy as BossEnemy;
    const barW = enemy.width;
    this.ctx.fillStyle = '#555';
    this.ctx.fillRect(enemy.x, enemy.y + enemy.height + 4, barW, 6);
    this.ctx.fillStyle = '#E53935';
    this.ctx.fillRect(enemy.x, enemy.y + enemy.height + 4, barW * (boss.health / 3), 6);
}
```

#### `src/level/levels.ts`
- Add Level 4 as a wide-open arena with a single `'B'` marker, a few patrol enemies at the perimeter, and stairs in the center (reachable only after all enemies — including boss — are dead, which the existing `enemies.length === 0` check handles)

---

## Plan 1D — Chaser Enemy

**Goal**: A new enemy that computes its grid position vs. the player's grid position each frame and moves one axis toward the player. Slower than patrol enemies to compensate for always closing in.

### Files to Change

#### `src/constants.ts`
- Add `CHASER_SPEED = 55` (pixels per second; slower than `PATROL_SPEED` for balance)

```typescript
export const CHASER_SPEED = 55;
```

#### `src/types.ts`
- Add `ENEMY_CHASER` to `EntityType`
- Add `SPAWN_CHASER` to `TileType`
- Add `'@'` → `TileType.SPAWN_CHASER` to `parseLevelString()`

```typescript
// EntityType addition
ENEMY_CHASER: 'enemy_chaser',

// TileType addition
SPAWN_CHASER: 'spawn_chaser',

// parseLevelString() switch addition
case '@': tile = TileType.SPAWN_CHASER; break;
```

#### `src/entities/ChaserEnemy.ts` (new file)

```typescript
import { Entity } from './Entity';
import { EntityType } from '../types';
import { TILE_SIZE, CHASER_SPEED } from '../constants';
import { LevelManager } from '../level/LevelManager';

export class ChaserEnemy extends Entity {
    constructor(x: number, y: number) {
        super('chaser', EntityType.ENEMY_CHASER, x, y, TILE_SIZE * 0.8, TILE_SIZE * 0.8);
    }

    public move(dt: number, level: LevelManager, playerX: number, playerY: number): void {
        const myGridX = Math.floor(this.x / TILE_SIZE);
        const myGridY = Math.floor(this.y / TILE_SIZE);
        const playerGridX = Math.floor(playerX / TILE_SIZE);
        const playerGridY = Math.floor(playerY / TILE_SIZE);

        const dx = playerGridX - myGridX;
        const dy = playerGridY - myGridY;

        let stepX = 0;
        let stepY = 0;

        if (Math.abs(dx) >= Math.abs(dy)) {
            stepX = Math.sign(dx);
        } else {
            stepY = Math.sign(dy);
        }

        const nextX = this.x + stepX * CHASER_SPEED * dt;
        const nextY = this.y + stepY * CHASER_SPEED * dt;
        const nextGridX = Math.floor(nextX / TILE_SIZE);
        const nextGridY = Math.floor(nextY / TILE_SIZE);

        if (!level.isSolid(nextGridX, nextGridY)) {
            this.x = nextX;
            this.y = nextY;
        }
    }
}
```

#### `src/level/levels.ts`
- Ensure `SPAWN_CHASER` tiles become `TileType.FLOOR` after the chaser is spawned (same as all other spawn markers — the tile is replaced in `loadLevel()` immediately after spawning)
- Add `'@'` to at least one level string for testing

#### `src/Game.ts`
- In `loadLevel()`, spawn `ChaserEnemy` when `tile === TileType.SPAWN_CHASER`
- In `update()`, for each enemy, if `enemy.type === EntityType.ENEMY_CHASER`, call `(enemy as ChaserEnemy).move(dt, this.levelManager, this.player.x, this.player.y)`

#### `src/rendering/Renderer.ts`
- In `renderEnemies()`, add `EntityType.ENEMY_CHASER` to the color branch:

```typescript
this.ctx.fillStyle =
    enemy.type === EntityType.ENEMY_PATROL ? COLORS.PATROL_ENEMY :
    enemy.type === EntityType.ENEMY_CHASER ? '#00BCD4' :   // cyan
    COLORS.WANDER_ENEMY;
```

Optionally render chaser eyes pointing toward the player's last known direction for visual character.

---

## Plan 1E — More Levels (4–6)

**Goal**: Add 3 new levels that introduce chaser enemies, pickups (assuming Plan 1B is implemented), and culminate in a boss arena (assuming Plan 1C is implemented). If Plans 1B and 1C are not yet done, omit those characters.

**Files**: `src/level/levels.ts` only

### Level 4 — Winding Corridors (introduces Chaser)

Design goals:
- Tight L-shaped corridors that force the player to commit to a direction
- 1 chaser enemy (`@`) that hunts the player through the narrow paths
- 1 patrol enemy (`*`) on a long straight corridor
- 1 heart pickup (`h`) hidden in a dead-end alcove
- Stairs (`$`) at the far end of the winding path

```
############
#..........#
#.########.#
#.#h.....#.#
#.#.#####.#$
#.#.@....#.#
#.#######..#
#.......*..#
#..########
############
```

(Adjust to exactly 12×10 with valid border walls before committing.)

### Level 5 — Mixed Enemy Gauntlet

Design goals:
- Open centre room ringed by obstacles
- 2 patrol enemies on opposite walls
- 1 wander enemy in the centre
- 1 chaser enemy starting in the top-left quadrant
- 3 coin pickups (`c`) scattered around the room
- Stairs at bottom-right, guarded by a fire pot (`)`

```
############
#c....*....#
#..####....#
#..#))#..c.#
#..#..#....#
#@.#..#....#
#..####....#
#......}.c.#
#..*.......$
############
```

(Adjust to exactly 12×10 with valid border walls before committing.)

### Level 6 — Boss Arena

Design goals:
- Wide open room (minimal internal walls) so the boss can charge freely
- 2 patrol enemies along the perimeter walls
- 1 boss (`B`) starting in the centre
- Stairs (`$`) at the very centre, only reachable once `enemies.length === 0` (existing mechanic)
- No heart pickups — the boss arena should feel tense

```
############
#...*......#
#..........#
#....B.....#
#..........#
#....$.....#
#..........#
#.....*....#
#..........#
############
```

(Adjust to exactly 12×10 with valid border walls before committing.)

### Implementation Note

Each level string must be exactly 12 characters wide and 10 lines tall, with border walls on all edges. Run `npm run build` after adding each level to catch any off-by-one errors in the string length. The existing `parseLevelString()` function will throw or silently misparse if row lengths are inconsistent.
