import { Entity } from './Entity';
import { EntityType } from '../types';
import { TILE_SIZE, PATROL_SPEED } from '../constants';
import { LevelManager } from '../level/LevelManager';

export class PatrolEnemy extends Entity {
    public direction: number = -1; // -1 for left, 1 for right

    constructor(id: string, x: number, y: number) {
        super(id, EntityType.ENEMY_PATROL, x, y, TILE_SIZE * 0.8, TILE_SIZE * 0.8);
    }

    public override update(_dt: number): void {
        // Movement is handled in collision system to check walls, 
        // but we can apply velocity here.
        // Actually, let's keep it simple: Entity updates its own position.
        // We need a reference to the level to check walls. We'll pass it in.
    }

    public move(dt: number, level: LevelManager): void {
        const speed = PATROL_SPEED * TILE_SIZE * dt;
        const newX = this.x + (this.direction * speed);

        // Convert to grid
        const gridXLeft = Math.floor(newX / TILE_SIZE);
        const gridXRight = Math.floor((newX + this.width) / TILE_SIZE);
        const gridY = Math.floor((this.y + this.height / 2) / TILE_SIZE); // Center Y for wall check

        // Check if hitting wall
        if (this.direction < 0 && level.isSolid(gridXLeft, gridY)) {
            this.direction = 1; // bounce
            this.x = (gridXLeft + 1) * TILE_SIZE; // snap to wall edge
        } else if (this.direction > 0 && level.isSolid(gridXRight, gridY)) {
            this.direction = -1; // bounce
            this.x = gridXRight * TILE_SIZE - this.width - 1; // snap to wall edge
        } else {
            this.x = newX;
        }
    }
}
