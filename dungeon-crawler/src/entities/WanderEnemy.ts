import { Entity } from './Entity';
import { EntityType } from '../types';
import { TILE_SIZE, WANDER_SPEED } from '../constants';
import { LevelManager } from '../level/LevelManager';

export class WanderEnemy extends Entity {
    public direction: number = -1; // -1 for up, 1 for down
    public timer: number = 0;

    constructor(id: string, x: number, y: number) {
        super(id, EntityType.ENEMY_WANDER, x, y, TILE_SIZE * 0.8, TILE_SIZE * 0.8);
        this.resetTimer();
    }

    private resetTimer(): void {
        // Random timer between 1 and 5 seconds
        this.timer = 1 + Math.random() * 4;
    }

    public override update(_dt: number): void {
        // handled in move method with level manager
    }

    public move(dt: number, level: LevelManager): void {
        this.timer -= dt;
        if (this.timer <= 0) {
            this.direction *= -1; // reverse
            this.resetTimer();
        }

        const speed = WANDER_SPEED * TILE_SIZE * dt;
        const newY = this.y + (this.direction * speed);

        // Convert to grid
        const gridX = Math.floor((this.x + this.width / 2) / TILE_SIZE); // Center X for wall check
        const gridYTop = Math.floor(newY / TILE_SIZE);
        const gridYBottom = Math.floor((newY + this.height) / TILE_SIZE);

        // Check if hitting wall
        if (this.direction < 0 && level.isSolid(gridX, gridYTop)) {
            this.direction = 1; // bounce
            this.y = (gridYTop + 1) * TILE_SIZE; // snap to wall edge
            this.resetTimer(); // Also reset timer on bounce for unpredictability
        } else if (this.direction > 0 && level.isSolid(gridX, gridYBottom)) {
            this.direction = -1; // bounce
            this.y = gridYBottom * TILE_SIZE - this.height - 1; // snap to wall edge
            this.resetTimer();
        } else {
            this.y = newY;
        }
    }
}
