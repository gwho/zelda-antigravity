import { World } from '../ecs/World';
import type { Position, Velocity, AI, Size } from '../ecs/Components';
import { LevelManager } from '../level/LevelManager';
import { PATROL_SPEED, WANDER_SPEED, TILE_SIZE } from '../constants';

export class AISystem {
    public static update(world: World, dt: number, level: LevelManager): void {
        const ais = world.getEntitiesWith('AI', 'Position', 'Velocity', 'Size');

        for (const entity of ais) {
            const ai = world.getComponent<AI>(entity, 'AI')!;
            const pos = world.getComponent<Position>(entity, 'Position')!;
            const vel = world.getComponent<Velocity>(entity, 'Velocity')!;
            const size = world.getComponent<Size>(entity, 'Size')!;

            if (ai.type === 'patrol') {
                const speed = PATROL_SPEED * TILE_SIZE;
                const newX = pos.x + (ai.dx * speed * dt);
                
                const gridXLeft = Math.floor(newX / TILE_SIZE);
                const gridXRight = Math.floor((newX + size.width) / TILE_SIZE);
                const gridY = Math.floor((pos.y + size.height / 2) / TILE_SIZE);

                if (ai.dx < 0 && level.isSolid(gridXLeft, gridY)) {
                    ai.dx = 1;
                    pos.x = (gridXLeft + 1) * TILE_SIZE;
                    vel.dx = 0;
                } else if (ai.dx > 0 && level.isSolid(gridXRight, gridY)) {
                    ai.dx = -1;
                    pos.x = gridXRight * TILE_SIZE - size.width - 1;
                    vel.dx = 0;
                } else {
                    vel.dx = ai.dx * speed;
                }
            } else if (ai.type === 'wander') {
                ai.timer -= dt;
                if (ai.timer <= 0) {
                    ai.dy *= -1;
                    ai.timer = 1 + Math.random() * 4;
                }

                const speed = WANDER_SPEED * TILE_SIZE;
                const newY = pos.y + (ai.dy * speed * dt);

                const gridX = Math.floor((pos.x + size.width / 2) / TILE_SIZE);
                const gridYTop = Math.floor(newY / TILE_SIZE);
                const gridYBottom = Math.floor((newY + size.height) / TILE_SIZE);

                if (ai.dy < 0 && level.isSolid(gridX, gridYTop)) {
                    ai.dy = 1;
                    pos.y = (gridYTop + 1) * TILE_SIZE;
                    ai.timer = 1 + Math.random() * 4;
                    vel.dy = 0;
                } else if (ai.dy > 0 && level.isSolid(gridX, gridYBottom)) {
                    ai.dy = -1;
                    pos.y = gridYBottom * TILE_SIZE - size.height - 1;
                    ai.timer = 1 + Math.random() * 4;
                    vel.dy = 0;
                } else {
                    vel.dy = ai.dy * speed;
                }
            }
        }
    }
}
