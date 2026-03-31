import { LevelManager } from '../level/LevelManager';
import { TileType, Direction, EntityType, GameState } from '../types';
import { TILE_SIZE, COLORS, CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_MAX_HEALTH } from '../constants';
import { World } from '../ecs/World';
import type { Position, Size, PlayerInput, AttackIntent, Health, Renderable } from '../ecs/Components';

export class Renderer {
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        // ... previous setup ...
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    public render(
        gameState: GameState,
        levelManager: LevelManager,
        world: World,
        score: number,
        levelNumber: number
    ): void {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (gameState === GameState.MENU) {
            this.renderMenu();
            return;
        }

        this.renderLevel(levelManager);
        
        const renderables = world.getEntitiesWith('Renderable', 'Position', 'Size');
        renderables.sort((a, b) => {
            const zA = world.getComponent<Renderable>(a, 'Renderable')!.zIndex;
            const zB = world.getComponent<Renderable>(b, 'Renderable')!.zIndex;
            return zA - zB;
        });

        for (const e of renderables) {
            const renderable = world.getComponent<Renderable>(e, 'Renderable')!;
            if (renderable.type === EntityType.PLAYER) {
                this.renderPlayer(world, e);
                const attack = world.getComponent<AttackIntent>(e, 'AttackIntent');
                if (attack && attack.inAnim) {
                    this.renderAttack(world, e, attack);
                }
            } else if (renderable.type === EntityType.ENEMY_PATROL || renderable.type === EntityType.ENEMY_WANDER) {
                this.renderEnemy(world, e, renderable.type);
            }
        }

        const players = world.getEntitiesWith('PlayerInput', 'Health');
        const enemiesCount = world.getEntitiesWith('AI').length;
        if (players.length > 0) {
            this.renderHUD(score, levelNumber, enemiesCount, world, players[0]);
        }

        if (gameState === GameState.GAME_OVER) {
            this.renderOverlayMessage('GAME OVER', `Final Score: ${score}`, 'Press SPACE to Restart');
        } else if (gameState === GameState.VICTORY) {
            this.renderOverlayMessage('YOU WIN!', `Final Score: ${score}`, 'Press SPACE to Play Again');
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

        this.ctx.fillStyle = COLORS.FLOOR;
        this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

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

    private renderPlayer(world: World, entity: number): void {
        const pos = world.getComponent<Position>(entity, 'Position')!;
        const size = world.getComponent<Size>(entity, 'Size')!;
        const input = world.getComponent<PlayerInput>(entity, 'PlayerInput')!;
        const health = world.getComponent<Health>(entity, 'Health')!;

        this.ctx.save();
        if (health && health.invincibilityTimer > 0) {
            this.ctx.globalAlpha = Math.floor(health.invincibilityTimer / 100) % 2 === 0 ? 0.3 : 1.0;
        }
        this.ctx.translate(pos.x + size.width / 2, pos.y + size.height / 2);

        let angle = 0;
        switch (input.facing) {
            case Direction.UP: angle = -Math.PI / 2; break;
            case Direction.DOWN: angle = Math.PI / 2; break;
            case Direction.LEFT: angle = Math.PI; break;
            case Direction.RIGHT: angle = 0; break;
        }
        this.ctx.rotate(angle);

        this.ctx.fillStyle = COLORS.PLAYER;
        this.ctx.fillRect(-size.width / 2, -size.height / 2, size.width, size.height);

        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.moveTo(size.width / 2, -size.height / 4);
        this.ctx.lineTo(size.width / 2 + 10, 0);
        this.ctx.lineTo(size.width / 2, size.height / 4);
        this.ctx.fill();

        this.ctx.restore();
    }

    private renderEnemy(world: World, entity: number, type: EntityType): void {
        const pos = world.getComponent<Position>(entity, 'Position')!;
        const size = world.getComponent<Size>(entity, 'Size')!;

        this.ctx.fillStyle = type === EntityType.ENEMY_PATROL ? COLORS.PATROL_ENEMY : COLORS.WANDER_ENEMY;
        this.ctx.fillRect(pos.x, pos.y, size.width, size.height);

        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(pos.x + 4, pos.y + 8, 8, 8);
        this.ctx.fillRect(pos.x + size.width - 12, pos.y + 8, 8, 8);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(pos.x + 6, pos.y + 10, 4, 4);
        this.ctx.fillRect(pos.x + size.width - 10, pos.y + 10, 4, 4);
    }

    private renderAttack(world: World, entity: number, attack: AttackIntent): void {
        const pos = world.getComponent<Position>(entity, 'Position')!;
        const input = world.getComponent<PlayerInput>(entity, 'PlayerInput')!;

        const progress = 1 - (attack.animTimer / 500); 

        let tx = Math.floor((pos.x + TILE_SIZE * 0.4) / TILE_SIZE);
        let ty = Math.floor((pos.y + TILE_SIZE * 0.4) / TILE_SIZE);
        switch (input.facing) {
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

    private renderHUD(score: number, level: number, enemiesCount: number, world: World, playerEntity: number): void {
        const health = world.getComponent<Health>(playerEntity, 'Health')!;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, 40);

        this.ctx.font = '18px Courier New';
        this.ctx.textAlign = 'left';
        for (let i = 0; i < PLAYER_MAX_HEALTH; i++) {
            this.ctx.fillStyle = i < health.current ? '#E53935' : '#555';
            this.ctx.fillText(i < health.current ? '♥' : '♡', 20 + i * 22, 27);
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
