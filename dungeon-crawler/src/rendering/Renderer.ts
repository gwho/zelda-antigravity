import { LevelManager } from '../level/LevelManager';
import { Player } from '../entities/Player';
import { Entity } from '../entities/Entity';
import { TileType, Direction, EntityType, GameState } from '../types';
import { TILE_SIZE, COLORS, CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_MAX_HEALTH } from '../constants';

export class Renderer {
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    public render(
        gameState: GameState,
        levelManager: LevelManager,
        player: Player,
        enemies: Entity[],
        score: number,
        levelNumber: number
    ): void {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (gameState === GameState.MENU) {
            this.renderMenu();
            return;
        }

        this.renderLevel(levelManager);
        this.renderEnemies(enemies);

        if (gameState === GameState.PLAYING) {
            this.renderPlayer(player);
            if (player.inAttackAnimation) {
                this.renderAttack(player);
            }
        }

        this.renderHUD(score, levelNumber, enemies.length, player);

        if (gameState === GameState.GAME_OVER) {
            this.renderOverlayMessage('GAME OVER', `Final Score: ${score}`, 'Press R to Restart');
        } else if (gameState === GameState.VICTORY) {
            this.renderOverlayMessage('YOU WIN!', `Final Score: ${score}`, 'Press R to Play Again');
        }
    }

    private renderLevel(level: LevelManager): void {
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 12; x++) {
                const tile = level.getTile(x, y);
                this.drawTile(x, y, tile);
            }
        }
    }

    private drawTile(x: number, y: number, type: TileType): void {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        // Base floor
        this.ctx.fillStyle = COLORS.FLOOR;
        this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

        // Grid lines for retro feel
        this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        this.ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);

        this.ctx.save();

        switch (type) {
            case TileType.WALL_TOP:
            case TileType.WALL_BOTTOM:
            case TileType.WALL_LEFT:
            case TileType.WALL_RIGHT:
            case TileType.CORNER_TL:
            case TileType.CORNER_TR:
            case TileType.CORNER_BL:
            case TileType.CORNER_BR:
            case TileType.EMPTY:
                this.ctx.fillStyle = COLORS.WALL;
                this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                // Bevel effect
                this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
                this.ctx.fillRect(px, py, TILE_SIZE, 4);
                this.ctx.fillRect(px, py, 4, TILE_SIZE);
                this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
                this.ctx.fillRect(px, py + TILE_SIZE - 4, TILE_SIZE, 4);
                this.ctx.fillRect(px + TILE_SIZE - 4, py, 4, TILE_SIZE);
                break;
            case TileType.DOOR_LEFT:
            case TileType.DOOR_TOP:
            case TileType.STAIRS:
                this.ctx.fillStyle = COLORS.DOOR;
                this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(px + 10, py + 10, TILE_SIZE - 20, TILE_SIZE - 20);
                break;
            case TileType.FIRE_POT:
            case TileType.LANTERN:
                this.ctx.fillStyle = COLORS.OBSTACLE;
                this.ctx.beginPath();
                this.ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE * 0.4, 0, Math.PI * 2);
                this.ctx.fill();

                // Glow effect for visual polish
                if (type === TileType.LANTERN) {
                    this.ctx.shadowBlur = 15;
                    this.ctx.shadowColor = '#FF9800';
                    this.ctx.fillStyle = '#FF9800';
                    this.ctx.beginPath();
                    this.ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE * 0.2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                break;
        }

        this.ctx.restore();
    }

    private renderPlayer(player: Player): void {
        this.ctx.save();
        if (player.isInvincible()) {
            this.ctx.globalAlpha = Math.floor(player.invincibilityTimer / 100) % 2 === 0 ? 0.3 : 1.0;
        }
        this.ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

        // Rotate based on facing
        let angle = 0;
        switch (player.facing) {
            case Direction.UP: angle = -Math.PI / 2; break;
            case Direction.DOWN: angle = Math.PI / 2; break;
            case Direction.LEFT: angle = Math.PI; break;
            case Direction.RIGHT: angle = 0; break;
        }
        this.ctx.rotate(angle);

        // Body
        this.ctx.fillStyle = COLORS.PLAYER;
        this.ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);

        // Facing indicator (little nose/sword hint)
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.moveTo(player.width / 2, -player.height / 4);
        this.ctx.lineTo(player.width / 2 + 10, 0);
        this.ctx.lineTo(player.width / 2, player.height / 4);
        this.ctx.fill();

        this.ctx.restore();
    }

    private renderEnemies(enemies: Entity[]): void {
        for (const enemy of enemies) {
            if (!enemy.isActive) continue;

            this.ctx.fillStyle = enemy.type === EntityType.ENEMY_PATROL ? COLORS.PATROL_ENEMY : COLORS.WANDER_ENEMY;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

            // Eyes
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(enemy.x + 4, enemy.y + 8, 8, 8);
            this.ctx.fillRect(enemy.x + enemy.width - 12, enemy.y + 8, 8, 8);
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(enemy.x + 6, enemy.y + 10, 4, 4);
            this.ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 10, 4, 4);
        }
    }

    private renderAttack(player: Player): void {
        // Visual polish: scale/fade 'kaboom'
        const progress = 1 - (player.attackAnimationTimer / 500); // 0 to 1

        let tx = player.getGridX();
        let ty = player.getGridY();
        switch (player.facing) {
            case Direction.UP: ty -= 1; break;
            case Direction.DOWN: ty += 1; break;
            case Direction.LEFT: tx -= 1; break;
            case Direction.RIGHT: tx += 1; break;
        }

        const cx = tx * TILE_SIZE + TILE_SIZE / 2;
        const cy = ty * TILE_SIZE + TILE_SIZE / 2;

        this.ctx.save();
        this.ctx.translate(cx, cy);

        const scale = 0.5 + Math.sin(progress * Math.PI) * 0.8;
        this.ctx.scale(scale, scale);
        this.ctx.globalAlpha = 1 - progress;

        this.ctx.fillStyle = COLORS.ATTACK;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = COLORS.ATTACK;

        // Spiky star shape
        this.ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            this.ctx.rotate(Math.PI / 4);
            this.ctx.lineTo(0, -TILE_SIZE * 0.6);
            this.ctx.rotate(Math.PI / 4);
            this.ctx.lineTo(0, -TILE_SIZE * 0.2);
        }
        this.ctx.fill();

        this.ctx.restore();
    }

    private renderHUD(score: number, level: number, enemiesCount: number, player: Player): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, 40);

        this.ctx.font = '18px Courier New';
        this.ctx.textAlign = 'left';
        for (let i = 0; i < PLAYER_MAX_HEALTH; i++) {
            this.ctx.fillStyle = i < player.health ? '#E53935' : '#555';
            this.ctx.fillText(i < player.health ? '♥' : '♡', 20 + i * 22, 27);
        }

        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = '20px Courier New';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Level: ${level}`, 100, 27);

        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, 27);

        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = enemiesCount === 0 ? '#4CAF50' : COLORS.TEXT;
        this.ctx.fillText(`Enemies: ${enemiesCount}`, CANVAS_WIDTH - 20, 27);
    }

    private renderMenu(): void {
        this.renderOverlayMessage('DUNGEON CRAWLER', 'Press SPACE to Start', 'Arrow Keys/WASD to move, Space to attack');
    }

    private renderOverlayMessage(title: string, subtitle: string, sub2: string): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.textAlign = 'center';

        this.ctx.font = '40px Courier New';
        this.ctx.fillStyle = '#FF9800';
        this.ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

        this.ctx.font = '24px Courier New';
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText(subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

        this.ctx.font = '16px Courier New';
        this.ctx.fillStyle = '#AAA';
        this.ctx.fillText(sub2, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }
}
