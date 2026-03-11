# TypeScript Primer for Absolute Beginners (via this project)

TypeScript = JavaScript + type labels. The labels are erased before the browser runs the code — they only exist to help you and your editor catch mistakes early. Nothing in this file changes how the game works; TypeScript only exists at write-time to stop you from accidentally passing the wrong kind of value to a function.

## How to use this file

1. Read a concept.
2. Open the linked file in your editor and find the line number.
3. Paste the Claude prompt into your Claude Code session.
4. Look up the keyword in the official docs for a deeper dive.

Work through the levels in order — each one builds on the previous.

---

## Concept Ladder

### Level 1 — Type Annotations

**What it is:** A `: SomeType` label after a variable or parameter name. It tells TypeScript "this value must always be this kind of thing."

**Where in this codebase:** `src/entities/Entity.ts:4–9` — every field has an explicit annotation.

```typescript
public x: number;              // x must always be a number
public isActive: boolean = true;  // starts true, can only ever be true/false
```

TypeScript can also *infer* the type when it's obvious — `src/constants.ts:1` declares `TILE_SIZE = 48` with no annotation because TypeScript already knows `48` is a number.

**Lookup keyword:** `TypeScript basic types`, `TypeScript type inference`

**Claude prompt:** `"In src/entities/Entity.ts, explain what the colon and the word after it mean for each field. What error would TypeScript show if I tried to write this.x = 'hello'?"`

---

### Level 2 — `const` and `let` (and why `const` almost everywhere)

**What it is:** `const` means "this variable will never be reassigned." `let` means "this variable can be reassigned later." TypeScript enforces `const` — if you try to reassign a `const`, it's an error before the code even runs.

**Where in this codebase:**
- `src/constants.ts` — every exported value uses `const` because game constants never change.
- `src/Game.ts` update loop — `let dt` is used because the delta-time value changes every frame.

**Lookup keyword:** `JavaScript const let var difference`

**Claude prompt:** `"In src/constants.ts, all values use const. In src/Game.ts update(), some use let. Explain why each choice was made."`

---

### Level 3 — Object Literals and Object Types

**What it is:** `{ key: value }` creates an object. TypeScript can describe the shape of that object as a type — what keys it must have and what types those values must be.

**Where in this codebase:**
- `src/constants.ts:19–29` — the `COLORS` object groups related string values.
- `src/entities/Entity.ts:29` — `getBounds()` has a return type written inline: `{ left: number, right: number, top: number, bottom: number }`.

**Lookup keyword:** `TypeScript object types`, `TypeScript inline object type`

**Claude prompt:** `"In src/entities/Entity.ts, getBounds() has a return type written inline as { left: number, right: ... }. Explain what that syntax means and what TypeScript would say if getBounds() returned { left: 'oops' }."`

---

### Level 4 — `export` and `import` (Modules)

**What it is:** Every `.ts` file in this project is a *module* — a self-contained unit. `export` makes a value available to other files. `import` pulls it in. Without `export`, a value is private to its file.

**Where in this codebase:**
- `src/constants.ts:1` — `export const TILE_SIZE = 48` makes it available everywhere.
- `src/entities/Entity.ts:1` — `import { EntityType } from '../types'` pulls in just the `EntityType` value by name.

**Lookup keyword:** `TypeScript ES modules import export`, `named export vs default export`

**Claude prompt:** `"Trace TILE_SIZE from where it is defined in constants.ts to where it is used in Entity.ts. Show me the exact import line and explain what the curly braces around EntityType mean."`

---

### Level 5 — Interfaces

**What it is:** An `interface` names and describes the shape of an object — what properties it must have and what types they must be. No runtime code is generated; it's purely a type-level contract. Any object that has the right properties satisfies the interface automatically.

**Where in this codebase:** `src/types.ts:45–53` — `interface Position` and `interface Size`.

```typescript
export interface Position {
    x: number;
    y: number;
}
```

**Lookup keyword:** `TypeScript interface`, `interface vs type alias`

**Claude prompt:** `"In src/types.ts, explain the Position interface. If I create const p: Position = { x: 10 } and forget y, what does TypeScript say? How is interface different from just writing { x: number; y: number } everywhere?"`

---

### Level 6 — Classes and Access Modifiers

**What it is:** A `class` is a blueprint for creating objects that share the same fields and methods. Access modifiers control who can touch those fields:
- `public` — anyone can read or write it.
- `private` — only code *inside that class* can touch it.
- `protected` — the class and its subclasses can touch it.

**Where in this codebase:** `src/entities/Entity.ts:3–40` — `export abstract class Entity` with `public` fields.

```typescript
export abstract class Entity {
    public id: string;           // accessible from anywhere
    public isActive: boolean = true;
```

**Lookup keyword:** `TypeScript class`, `TypeScript public private protected`

**Claude prompt:** `"In src/entities/Entity.ts, all fields are public. In src/entities/Player.ts, find any private fields and explain why they are private while the others are public."`

---

### Level 7 — `static` Methods

**What it is:** A `static` method belongs to the *class itself*, not to any specific object created from it. You call it as `ClassName.method()` — no `new` required.

**Where in this codebase:** `src/systems/CollisionSystem.ts:7` — `public static checkOverlap(a: Entity, b: Entity): boolean`.

The collision system has no internal state to track — it just takes two things and checks if they overlap. Making it `static` signals: "this is a utility function, not something that needs its own object."

**Lookup keyword:** `TypeScript static method`

**Claude prompt:** `"In CollisionSystem.ts, checkOverlap is static. Show me how it is called in Game.ts. Why does it make sense for a collision-checking method to be static — what would be weird about creating a 'new CollisionSystem()' first?"`

---

### Level 8 — `abstract` Classes and Methods

**What it is:** An `abstract` class cannot be instantiated directly — you can never write `new Entity()`. It only exists to be extended by concrete subclasses. An `abstract` method has *no body* — every subclass *must* provide its own implementation.

**Where in this codebase:** `src/entities/Entity.ts:3,39`

```typescript
export abstract class Entity { ... }         // can't do: new Entity()
public abstract update(dt: number): void;    // no body — subclasses must implement
```

`Player`, `PatrolEnemy`, and `WanderEnemy` all extend `Entity` and each provides its own `update()` logic.

**Lookup keyword:** `TypeScript abstract class`, `abstract method`

**Claude prompt:** `"In Entity.ts, update() is abstract with no body. Find where Player.ts and PatrolEnemy.ts provide their implementations. What error would TypeScript show if I created a subclass of Entity and forgot to add update()?"`

---

### Level 9 — `as const` (Readonly Object)

**What it is:** `as const` tells TypeScript "treat every value in this object as a literal, unchangeable constant — never widen the type."

**Where in this codebase:** `src/types.ts:1–6`

```typescript
export const Direction = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
} as const;
```

Without `as const`: TypeScript infers `UP: string` (any string could be assigned later).
With `as const`: TypeScript infers `UP: 'up'` (only the literal `'up'` is valid). This is what lets the type system catch a typo like `direction = 'upward'` as an error.

**Lookup keyword:** `TypeScript as const`, `const assertion`

**Claude prompt:** `"In src/types.ts, explain what as const does to the Direction object. If I write Direction.UP = 'sideways', what does TypeScript say? Without as const, what type would TypeScript infer for Direction.UP?"`

---

### Level 10 — `typeof` and `keyof` (Type Extraction)

**What it is:** Two operators that let you *derive* types from existing values instead of writing them twice.
- `typeof X` — extracts the TypeScript type of a value.
- `keyof T` — produces a union of all key names in a type.

**Where in this codebase:** `src/types.ts:7`

```typescript
export type Direction = typeof Direction[keyof typeof Direction];
```

Breaking it down step by step:
1. `typeof Direction` → the type of the whole object: `{ UP: 'up', DOWN: 'down', LEFT: 'left', RIGHT: 'right' }`
2. `keyof typeof Direction` → the union of key names: `'UP' | 'DOWN' | 'LEFT' | 'RIGHT'`
3. `typeof Direction[keyof typeof Direction]` → index into the object type using those keys → `'up' | 'down' | 'left' | 'right'`

This means if you add a new direction to the object, the type updates automatically — you never maintain two lists.

**Lookup keyword:** `TypeScript typeof type operator`, `TypeScript keyof`, `TypeScript indexed access types`

**Claude prompt:** `"In src/types.ts line 7, break down typeof Direction[keyof typeof Direction] step by step. What type does it produce? Why is this better than writing type Direction = 'up' | 'down' | 'left' | 'right' manually?"`

---

### Level 11 — Union Types

**What it is:** `A | B` means "this value is either type A or type B." TypeScript tracks both possibilities and only lets you use things that work for both — unless you first check which one it actually is (called *narrowing*).

**Where in this codebase:** The `Direction` type from Level 10 is `'up' | 'down' | 'left' | 'right'`. The `enemies` array in `Game.ts` can hold `PatrolEnemy | WanderEnemy` objects — both extend `Entity`, so they can be stored as `Entity[]`.

**Lookup keyword:** `TypeScript union types`, `TypeScript type narrowing`

**Claude prompt:** `"In src/systems/CollisionSystem.ts, checkPlayerEnemyCollisions accepts enemies: Entity[]. Entity is the base class. Explain how TypeScript treats an array that can contain Player, PatrolEnemy, and WanderEnemy objects — what methods can you call on each item without a type check?"`

---

### Level 12 — Optional Parameters (`?`)

**What it is:** A parameter or property marked `?` is optional — the caller can omit it, in which case its value is `undefined`. TypeScript forces you to handle the `undefined` case before using the value.

**Where in this codebase:** Check `src/rendering/Renderer.ts` for any `param?: Type` patterns.

**Lookup keyword:** `TypeScript optional parameter`, `TypeScript optional chaining ?.`

**Claude prompt:** `"Find an optional parameter (marked with ?) anywhere in the dungeon-crawler src/ directory. Show me how the code handles the case where that parameter is not provided."`

---

## Quick Reference: TypeScript in One Page

| Syntax | Meaning | Example from this project |
|--------|---------|--------------------------|
| `: number` | Type annotation | `public x: number` (Entity.ts:5) |
| `const` | Never reassigned | All of constants.ts |
| `let` | Can be reassigned | `let dt` in Game.ts |
| `interface` | Object shape contract | `interface Position` (types.ts:45) |
| `class` | Object blueprint | `class Entity` (Entity.ts:3) |
| `public` / `private` | Access control | `public isActive` (Entity.ts:10) |
| `static` | Belongs to class, not instance | `CollisionSystem.checkOverlap` |
| `abstract` | Must be implemented by subclass | `abstract update(dt)` (Entity.ts:39) |
| `as const` | Freeze object as literal types | `Direction = {...} as const` (types.ts:6) |
| `typeof` | Extract type from a value | `typeof Direction` (types.ts:7) |
| `keyof` | Union of all key names | `keyof typeof Direction` (types.ts:7) |
| `A \| B` | Union — either type | `'up' \| 'down' \| ...` (types.ts:7) |
| `param?` | Optional parameter | Various in Renderer.ts |
| `export` / `import` | Module system | Every file |

---

## External Resources (use in parallel)

This file covers *why* TypeScript is used the way it is in this specific codebase. Use these resources for syntax drills and exercises that don't need game context:

- **TypeScript Handbook** (official, free): https://www.typescriptlang.org/docs/handbook/intro.html — read "The Basics" and "Everyday Types" chapters first.
- **TypeScript Playground**: https://www.typescriptlang.org/play — paste any snippet from this project and edit it live; the editor shows type errors in real time.

**Suggested order:**
1. Read Levels 1–5 of this primer.
2. Read "The Basics" chapter in the handbook.
3. Come back for Levels 6–12.
4. Revisit the exercises in `TUTORIAL.md` with your new TypeScript vocabulary.
