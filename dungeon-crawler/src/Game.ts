import { Renderer } from './rendering/Renderer';
import { InputManager } from './input/InputManager';
import { LevelManager } from './level/LevelManager';
import { Player } from './entities/Player';
import { Entity } from './entities/Entity';
import { PatrolEnemy } from './entities/PatrolEnemy';
import { WanderEnemy } from './entities/WanderEnemy';
import { GameState, TileType } from './types';
import { CollisionSystem } from './systems/CollisionSystem';
import { CombatSystem } from './systems/CombatSystem';
import { TILE_SIZE } from './constants';

export class Game {
    private renderer: Renderer;
    private input: InputManager;
    private levelManager: LevelManager;

    private player!: Player;
    private enemies: Entity[] = [];

    private gameState: GameState = GameState.MENU;
    private score: number = 0;

    private lastTime: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.renderer = new Renderer(canvas);
        this.input = new InputManager();
        this.levelManager = new LevelManager();

        // Start loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    private loadLevel(index: number) {
        this.levelManager.loadLevel(index);

        // Spawn player
        this.player = new Player(
            this.levelManager.spawnX * TILE_SIZE + (TILE_SIZE - TILE_SIZE * 0.8) / 2,
            this.levelManager.spawnY * TILE_SIZE + (TILE_SIZE - TILE_SIZE * 0.8) / 2
        );

        // Spawn enemies
        this.enemies = [];
        let enemyId = 0;

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 12; x++) {
                const tile = this.levelManager.getTile(x, y);
                if (tile === TileType.SPAWN_PATROL) {
                    this.enemies.push(new PatrolEnemy(`e_${enemyId++}`, x * TILE_SIZE + 4, y * TILE_SIZE + 4));
                    this.levelManager.setTile(x, y, TileType.FLOOR);
                } else if (tile === TileType.SPAWN_WANDER) {
                    this.enemies.push(new WanderEnemy(`e_${enemyId++}`, x * TILE_SIZE + 4, y * TILE_SIZE + 4));
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
            // Loop back to start to fulfill requirements (or show victory)
            this.gameState = GameState.VICTORY;
        }
    }

    private checkLevelTransitions() {
        const px = this.player.getGridX();
        const py = this.player.getGridY();
        const tile = this.levelManager.getTile(px, py);

        if (tile === TileType.DOOR_LEFT || tile === TileType.DOOR_TOP || tile === TileType.STAIRS) {
            if (this.enemies.length === 0) {
                this.completeLevel();
            } else {
                // Reject exit, apply CSS visual polish (screen flash)
                this.triggerScreenFlash();
                // Push player back slightly
                const cx = px * TILE_SIZE + TILE_SIZE / 2;
                const cy = py * TILE_SIZE + TILE_SIZE / 2;
                this.player.x += (this.player.x < cx ? -10 : 10);
                this.player.y += (this.player.y < cy ? -10 : 10);
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

        // Cap dt to prevent tunneling after tab-switch
        if (dt > 0.1) dt = 0.1;

        this.update(dt);
        this.renderer.render(
            this.gameState,
            this.levelManager,
            this.player,
            this.enemies,
            this.score,
            this.levelManager.currentLevelIndex + 1
        );
        this.input.update(); // clear just pressed

        requestAnimationFrame((t) => this.loop(t));
    }

    private update(dt: number) {
        if (this.gameState === GameState.MENU) {
            if (this.input.isJustPressed('attack')) {
                this.startGame();
            }
            return;
        }

        if (this.gameState === GameState.GAME_OVER || this.gameState === GameState.VICTORY) {
            if (this.input.isDown('attack') || this.input.isDown('up') || this.input.isDown('down') || this.input.isDown('left') || this.input.isDown('right')) {
                // We use any movement to restart just to be friendly, though UI says 'R'
                // Actually let's restrict to 'R' key later or just 'Space'.
            }
            // Check literature 'restart' action
            if (this.input.isJustPressed('restart') || this.input.isJustPressed('attack')) {
                this.startGame();
            }
            return;
        }

        // Playing state
        this.player.update(dt);
        this.player.handleInput(this.input, this.levelManager);

        for (const enemy of this.enemies) {
            if (enemy instanceof PatrolEnemy || enemy instanceof WanderEnemy) {
                enemy.move(dt, this.levelManager);
            }
        }

        this.checkLevelTransitions();

        // Combat
        CombatSystem.processAttacks(this.player, this.enemies, (deadEnemy) => {
            this.enemies = this.enemies.filter(e => e !== deadEnemy);
            this.score += 10;
        });

        // Game Over
        if (CollisionSystem.checkPlayerEnemyCollisions(this.player, this.enemies)) {
            this.gameState = GameState.GAME_OVER;
        }
    }
}
