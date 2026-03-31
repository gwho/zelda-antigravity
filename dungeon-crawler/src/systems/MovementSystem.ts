import { World } from '../ecs/World';
import type { Position, Velocity } from '../ecs/Components';

export class MovementSystem {
    public static update(world: World, dt: number): void {
        const entities = world.getEntitiesWith('Position', 'Velocity');
        for (const entity of entities) {
            const pos = world.getComponent<Position>(entity, 'Position')!;
            const vel = world.getComponent<Velocity>(entity, 'Velocity')!;
            
            pos.x += vel.dx * dt;
            pos.y += vel.dy * dt;
        }
    }
}
