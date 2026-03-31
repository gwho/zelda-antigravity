import { Renderer } from './rendering/Renderer';
import { InputManager } from './input/InputManager';
import { LevelManager } from './level/LevelManager';
import { GameState, TileType } from './types';
import { TILE_SIZE } from './constants';
import { World } from './ecs/World';
import { Prefabs } from './ecs/Prefabs';
import { PlayerControlSystem } from './systems/PlayerControlSystem';
import { AISystem } from './systems/AISystem';
import { MovementSystem } from './systems/MovementSystem';
import { CombatSystem } from './systems/CombatSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import type { Position } from './ecs/Components';

export class Game {
    private renderer: Renderer;
    private input: InputManager;
    private levelManager: LevelManager;
    private world: World;

    private gameState: GameState = GameState.MENU;
    private score: number = 0;
    private lastTime: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.renderer = new Renderer(canvas);
        this.input = new InputManager();
        this.levelManager = new LevelManager();
        this.world = new World();

        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    private loadLevel(index: number) {
        this.levelManager.loadLevel(index);

        // Reset world completely
        this.world = new World();

        // Spawn player
        Prefabs.createPlayer(
            this.world,
            this.levelManager.spawnX * TILE_SIZE + (TILE_SIZE - TILE_SIZE * 0.8) / 2,
            this.levelManager.spawnY * TILE_SIZE + (TILE_SIZE - TILE_SIZE * 0.8) / 2
        );

        // Spawn enemies
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 12; x++) {
                const tile = this.levelManager.getTile(x, y);
                if (tile === TileType.SPAWN_PATROL) {
                    Prefabs.createPatrolEnemy(this.world, x * TILE_SIZE + 4, y * TILE_SIZE + 4);
                    this.levelManager.setTile(x, y, TileType.FLOOR);
                } else if (tile === TileType.SPAWN_WANDER) {
                    Prefabs.createWanderEnemy(this.world, x * TILE_SIZE + 4, y * TILE_SIZE + 4);
                    this.levelManager.setTile(x, y, TileType.FLOOR);
                }
            }
        }
    }

    private startGame() {
        this.score = 0;
        this.gameState = GameState.PLAYING;
        this.loadLevel(0);
    }

    private completeLevel() {
        if (this.levelManager.currentLevelIndex + 1 < this.levelManager.totalLevels) {
            this.loadLevel(this.levelManager.currentLevelIndex + 1);
        } else {
            this.gameState = GameState.VICTORY;
        }
    }

    private checkLevelTransitions() {
        const players = this.world.getEntitiesWith('PlayerInput', 'Position');
        if (players.length === 0) return;
        
        const pos = this.world.getComponent<Position>(players[0], 'Position')!;
        const px = Math.floor((pos.x + TILE_SIZE * 0.4) / TILE_SIZE);
        const py = Math.floor((pos.y + TILE_SIZE * 0.4) / TILE_SIZE);
        const tile = this.levelManager.getTile(px, py);

        if (tile === TileType.DOOR_LEFT || tile === TileType.DOOR_TOP || tile === TileType.STAIRS) {
            const enemies = this.world.getEntitiesWith('AI');
            if (enemies.length === 0) {
                this.completeLevel();
            } else {
                this.triggerScreenFlash();
                const cx = px * TILE_SIZE + TILE_SIZE / 2;
                const cy = py * TILE_SIZE + TILE_SIZE / 2;
                pos.x += (pos.x < cx ? -10 : 10);
                pos.y += (pos.y < cy ? -10 : 10);
            }
        }
    }

    private triggerScreenFlash() {
        const container = document.getElementById('game-container');
        if (container) {
            container.classList.add('flash-red', 'shake');
            setTimeout(() => {
                container.classList.remove('flash-red', 'shake');
            }, 400);
        }
    }

    private loop(currentTime: number) {
        let dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        if (dt > 0.1) dt = 0.1;

        this.update(dt);
        this.renderer.render(
            this.gameState,
            this.levelManager,
            this.world,
            this.score,
            this.levelManager.currentLevelIndex + 1
        );
        this.input.update();

        requestAnimationFrame((t) => this.loop(t));
    }

    private update(dt: number) {
        if (this.gameState === GameState.MENU) {
            if (this.input.isJustPressed('attack')) this.startGame();
            return;
        }

        if (this.gameState === GameState.GAME_OVER || this.gameState === GameState.VICTORY) {
            if (this.input.isJustPressed('restart') || this.input.isJustPressed('attack')) {
                this.startGame();
            }
            return;
        }

        PlayerControlSystem.update(this.world, dt, this.input, this.levelManager);
        AISystem.update(this.world, dt, this.levelManager);
        MovementSystem.update(this.world, dt);
        
        this.checkLevelTransitions();

        CombatSystem.processAttacks(this.world, (deadEntity) => {
            this.world.destroyEntity(deadEntity);
            this.score += 10;
        });

        CollisionSystem.updateHealthTimers(this.world, dt);

        if (CollisionSystem.checkPlayerEnemyCollisions(this.world)) {
            this.gameState = GameState.GAME_OVER;
        }

        this.world.cleanupDestroyed();
    }
}
