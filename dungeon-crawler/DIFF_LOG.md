# Diff Log — PLANS.md Review & Revision

This file records every change made to `PLANS.md` during the post-authorship review session,
alongside the rationale for each change. It is intended as a learning resource: what a
real code-review cycle looks like, how diffs map to reasoning, and how to write commit
messages and PR descriptions that communicate intent rather than just mechanics.

---

## What Happened and Why

`PLANS.md` was written as a first-draft implementation spec. It was then reviewed against
the actual codebase and five concrete bugs / anti-patterns were found. The diffs below
record exactly what was wrong, what was changed, and why — the same information that
would appear in a pull-request review thread or a commit message on a professional project.

---

## Diff 1 — Plan 1B: Add visual feedback on pickup collection

### The problem
`checkPickups()` updated `player.health` and `score` in memory with no sensory output.
The HUD would change, but the player would feel nothing — pickups might as well be
invisible floor tiles.

### What changed
Added calls to `this.triggerScreenFlash()` inside each pickup branch:

```diff
  if (tile === TileType.HEART_PICKUP) {
      this.player.health = Math.min(this.player.health + 1, PLAYER_MAX_HEALTH);
      this.levelManager.setTile(gx, gy, TileType.FLOOR);
+     this.triggerScreenFlash();
  } else if (tile === TileType.COIN) {
      this.score += COIN_SCORE_VALUE;
      this.levelManager.setTile(gx, gy, TileType.FLOOR);
+     this.triggerScreenFlash();
  }
```

### Why this approach
`triggerScreenFlash()` already exists in `Game.ts` and applies a CSS class animation
to `#game-container`. Zero new architecture is needed. A floating-text particle system
was considered but rejected as over-engineered for this stage — it would require a
separate collection of transient UI objects outside the entity array and a dedicated
render pass. The existing CSS mechanism costs two lines.

**Future enhancement**: parameterise `triggerScreenFlash(colorClass?: string)` so heart
pickups flash green and coins flash gold. This is a single-method signature change.

---

## Diff 2 — Plan 1C: Fix BossEnemy wall collision (single-point → four-corner check)

### The problem
```typescript
// Before — only checks top-left corner of the boss bounding box
const nextGridX = Math.floor(nextX / TILE_SIZE);
const nextGridY = Math.floor(nextY / TILE_SIZE);
if (!level.isSolid(nextGridX, nextGridY)) { ... }
```

The boss is `TILE_SIZE * 1.8 = 86.4px` wide. `Math.floor(nextX / TILE_SIZE)` samples
only the top-left pixel's grid cell. The right edge of the boss sits ~86px further right,
possibly one or two tile-widths away. A boss standing near a right-side wall would walk
straight through it because its top-left corner never enters the wall tile.

Regular enemies (`TILE_SIZE * 0.8 = 38.4px`) fit inside one tile, so the single-point
check is an acceptable approximation for them. It is not acceptable for anything larger
than one tile.

### What changed
```diff
- const nextGridX = Math.floor(nextX / TILE_SIZE);
- const nextGridY = Math.floor(nextY / TILE_SIZE);
- if (!level.isSolid(nextGridX, nextGridY)) {
-     this.x = nextX;
-     this.y = nextY;
- }
+ const right  = nextX + this.width  - 1;
+ const bottom = nextY + this.height - 1;
+ const blocked =
+     level.isSolid(Math.floor(nextX  / TILE_SIZE), Math.floor(nextY   / TILE_SIZE)) ||
+     level.isSolid(Math.floor(right  / TILE_SIZE), Math.floor(nextY   / TILE_SIZE)) ||
+     level.isSolid(Math.floor(nextX  / TILE_SIZE), Math.floor(bottom  / TILE_SIZE)) ||
+     level.isSolid(Math.floor(right  / TILE_SIZE), Math.floor(bottom  / TILE_SIZE));
+ if (!blocked) {
+     this.x = nextX;
+     this.y = nextY;
+ }
```

### Rule of thumb
Any entity whose `width` or `height` exceeds `TILE_SIZE` must use multi-point collision.
The four-corner check is the minimal correct approach for AABB vs. tile-grid collision.

---

## Diff 3 — Plan 1C: Fix BossEnemy line-of-sight (column/row equality → wall scan)

### The problem
```typescript
// Before — checks shared row/column but ignores walls in between
if (myGridX === playerGridX || myGridY === playerGridY) {
    // charge...
}
```

If the player is in the same column as the boss but there is a wall tile between them,
the boss charges into the wall indefinitely. The boss level design ("wide open arena")
reduces how often this triggers but does not eliminate it.

### What changed
```diff
- if (myGridX === playerGridX || myGridY === playerGridY) {
-     // charge...
- }
+ const sharesRow = myGridY === playerGridY;
+ const sharesCol = myGridX === playerGridX;
+ if (!sharesRow && !sharesCol) return;
+
+ // Walk every tile between boss and player on the shared axis.
+ // If any tile is solid, abort — the boss cannot see the player.
+ let losBlocked = false;
+ if (sharesRow) {
+     const minX = Math.min(myGridX, playerGridX);
+     const maxX = Math.max(myGridX, playerGridX);
+     for (let gx = minX + 1; gx < maxX; gx++) {
+         if (level.isSolid(gx, myGridY)) { losBlocked = true; break; }
+     }
+ } else {
+     const minY = Math.min(myGridY, playerGridY);
+     const maxY = Math.max(myGridY, playerGridY);
+     for (let gy = minY + 1; gy < maxY; gy++) {
+         if (level.isSolid(myGridX, gy)) { losBlocked = true; break; }
+     }
+ }
+ if (losBlocked) return;
+ // charge...
```

### Cost
At most 10–11 `isSolid()` calls per frame for the boss (one per tile across the arena).
`isSolid()` is a single array lookup — negligible.

---

## Diff 4 — Plan 1C: Replace `as any` type-casting in CombatSystem with polymorphism

### The problem
```typescript
// Before — abandons TypeScript type safety
if ('takeDamage' in enemy && typeof (enemy as any).takeDamage === 'function') {
    (enemy as any).takeDamage();
    if ('isAlive' in enemy && !(enemy as any).isAlive()) {
        handleKill(enemy);
    }
} else {
    handleKill(enemy);
}
```

`as any` removes all compile-time checking. TypeScript can no longer catch a typo in
`takeDamage`, a wrong argument type, or a removed method. The `in` operator checks are
runtime duck-typing — the same pattern JavaScript used before TypeScript existed. The
purpose of a typed language is precisely to make this unnecessary.

### What changed

**Added to `src/entities/Entity.ts`:**
```diff
+ public takeDamage(): void {
+     // Default: instant death on first hit.
+     // Subclasses override for multi-hit behaviour.
+     this.isActive = false;
+ }
+
+ public isAlive(): boolean {
+     return this.isActive;
+ }
```

**`src/systems/CombatSystem.ts`:**
```diff
- if ('takeDamage' in enemy && typeof (enemy as any).takeDamage === 'function') {
-     (enemy as any).takeDamage();
-     if ('isAlive' in enemy && !(enemy as any).isAlive()) {
-         handleKill(enemy);
-     }
- } else {
-     handleKill(enemy);
- }
+ enemy.takeDamage();
+ if (!enemy.isAlive()) {
+     handleKill(enemy);
+ }
```

### Why this is better
- Patrol and wander enemies call the base `takeDamage()` which deactivates them —
  same instant-kill behaviour as before, zero extra code.
- `BossEnemy.takeDamage()` decrements health; `BossEnemy.isAlive()` checks `health > 0`.
- `CombatSystem` is now open for extension (any future multi-hit enemy just overrides
  the base methods) and closed for modification — the Open/Closed Principle in practice.
- Every call site is fully type-checked by the compiler.

---

## Diff 5 — Plan 1D: Add wall-slide to ChaserEnemy to prevent corner-snagging

### The problem
```typescript
// Before — freezes completely if preferred axis is blocked
if (!level.isSolid(nextGridX, nextGridY)) {
    this.x = nextX;
    this.y = nextY;
}
// else: do nothing — enemy stops dead
```

A chaser approaching from a diagonal angle along a corridor wall picks one axis (the
one with greater grid distance) and moves only on that axis. If a wall lies on that axis,
the chaser freezes — even when the orthogonal axis is completely clear and would advance
it toward the player.

This is the "corner snag" problem, a classic failure mode of naive single-axis chasers.

### What changed
```diff
- if (Math.abs(dx) >= Math.abs(dy)) {
-     stepX = Math.sign(dx);
- } else {
-     stepY = Math.sign(dy);
- }
-
- const nextX     = this.x + stepX * CHASER_SPEED * dt;
- const nextY     = this.y + stepY * CHASER_SPEED * dt;
- const nextGridX = Math.floor(nextX / TILE_SIZE);
- const nextGridY = Math.floor(nextY / TILE_SIZE);
-
- if (!level.isSolid(nextGridX, nextGridY)) {
-     this.x = nextX;
-     this.y = nextY;
- }
+ const primaryIsX   = Math.abs(dx) >= Math.abs(dy);
+ const primaryStepX = primaryIsX ? Math.sign(dx) : 0;
+ const primaryStepY = primaryIsX ? 0 : Math.sign(dy);
+ const slideStepX   = primaryIsX ? 0 : Math.sign(dx);
+ const slideStepY   = primaryIsX ? Math.sign(dy) : 0;
+
+ const tryMove = (stepX: number, stepY: number): boolean => {
+     if (stepX === 0 && stepY === 0) return false;
+     const nextX     = this.x + stepX * CHASER_SPEED * dt;
+     const nextY     = this.y + stepY * CHASER_SPEED * dt;
+     const nextGridX = Math.floor(nextX / TILE_SIZE);
+     const nextGridY = Math.floor(nextY / TILE_SIZE);
+     if (!level.isSolid(nextGridX, nextGridY)) {
+         this.x = nextX;
+         this.y = nextY;
+         return true;
+     }
+     return false;
+ };
+
+ if (!tryMove(primaryStepX, primaryStepY)) {
+     tryMove(slideStepX, slideStepY);
+ }
```

### Why this works
The chaser tries its preferred axis first. If that fails, it tries the orthogonal axis.
The enemy never fully stops unless both axes are blocked (a true dead-end). This is not
full A* pathfinding — it is two `isSolid` checks — but it eliminates the most common
visible failure mode and makes the enemy feel meaningfully smarter.

---

## Diff 6 — Plan 1E: Fix off-by-one in Level 4 row 9

### The problem
Row 9 of the Level 4 draft string was 11 characters:

```
#..########   ← 11 characters (missing trailing wall)
```

`parseLevelString()` iterates rows by splitting on newlines and reads each character by
index. If a row is shorter than `GRID_WIDTH` (12), every tile from the missing index
onward maps to `undefined` in the switch statement and lands on the default case.
Depending on what the default is, this either produces invisible floor tiles where walls
should be, or the parser silently continues with a corrupted grid — no runtime error,
just subtly wrong geometry that is very hard to visually debug.

### What changed
```diff
- #..########
+ #..#########
```

### Count verification
`#`(1) + `..`(2) + `#########`(9) = 12 ✓

---

## How to Write Commits and PRs for Changes Like These

### Commit anatomy
A professional commit for this review session would read:

```
fix(plans): correct five bugs found in post-authorship review

- Boss collision: check all 4 bounding-box corners, not just top-left;
  a 1.8-tile entity clips through walls with a single-point check
- Boss LOS: scan tiles between boss and player before charging;
  shared row/column ≠ clear line of sight
- CombatSystem: replace `as any` duck-typing with Entity base-class
  defaults for takeDamage/isAlive — full type safety, no casting
- ChaserEnemy: add axis-slide fallback so enemy doesn't freeze on
  corners when its preferred movement axis is blocked
- Level 4 row 9: fix 11-char string to 12 chars (missing trailing wall)

Also adds visual feedback (triggerScreenFlash) for pickup collection
in Plan 1B — reuses existing infrastructure, no new architecture.
```

**What makes this good:**
- The subject line names the scope (`plans`) and the type (`fix`)
- The body itemises each discrete change with a one-line rationale
- Every entry answers "what was wrong" not just "what was changed"
- No line is vague ("updated code", "fixed issues")

### What makes a good PR description
A PR for this review would look like:

```markdown
## What
Post-authorship review of PLANS.md found five correctness issues and
one UX gap. This PR corrects all six before implementation begins.

## Why each change matters
| Area | Bug class | Risk if shipped |
|------|-----------|-----------------|
| Boss 4-corner collision | Logic error | Boss clips through walls at room edges |
| Boss LOS wall scan | Logic error | Boss charges walls when sharing a row/column |
| CombatSystem `as any` | Type safety | Typos in method names compile silently |
| Chaser slide logic | Behaviour bug | Enemy freezes on any corner tile |
| Level 4 row 9 length | Data error | Corrupted tile grid, silent parse failure |
| Pickup feedback | UX gap | Player can't feel collectibles |

## How to verify
- Read the updated code blocks in PLANS.md and confirm they match the
  analysis in DIFF_LOG.md
- When implemented: run `npm run build` (no TS errors)
- Manual: play boss level — boss should not clip walls or charge
  through obstacles; chaser should navigate corridors smoothly;
  picking up a heart/coin should trigger a visible flash
```

**What makes this good:**
- Clearly separates "what changed" from "why it matters"
- The table gives reviewers a fast risk triage without reading every diff
- The verification section tells reviewers exactly what to test, not just
  "lgtm, looks fine"
- It does not say "minor fixes" or "polish" — it names specific bug classes

### The general principle
Commit messages and PR descriptions are written for two audiences:
1. **A reviewer today** who needs to understand what to check and approve
2. **You in 6 months** running `git log` and `git blame` trying to understand
   why a piece of code looks the way it does

Every commit that only says "fix bug" or "update plan" fails both audiences.
The rationale — *why* something was wrong and *why* the fix is the right one —
is the most valuable information in version control history, and it costs
nothing to write at the time of the change.
