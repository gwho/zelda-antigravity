# Dungeon Crawler (TypeScript + Canvas)

A top-down, grid-based dungeon crawler built purely with TypeScript and HTML5 Canvas. No game engines or external dependencies.

## Features
- Grid-snapped player movement (one tile per keypress).
- Continuous delta-time enemy movement (Patrol & Wander behaviors).
- Dynamic levels with walls, doors, and obstacles.
- Simple, satisfying rendering with CSS visual polish (screen shake/flash on errors).
- Clean, decoupled architecture using an Entity-Component-System (ECS) styled pattern.

## Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- npm

## Setup & Run
1. Navigate to the project directory:
   ```bash
   cd dungeon-crawler
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

## Controls
- **Movement**: Arrow Keys or WASD
- **Attack**: Spacebar (spawns an attack in the direction you are facing)
- **Restart**: R (or Space on Game Over screen)

Defeat all enemies in the level to unlock the doors!
