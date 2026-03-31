import { World } from '../ecs/World';
import type { Position, Size, Health } from '../ecs/Components';
import { INVINCIBILITY_DURATION } from '../constants';

export class CollisionSystem {

    public static checkOverlap(posA: Position, sizeA: Size, posB: Position, sizeB: Size): boolean {
        const leftA = posA.x;
        const rightA = posA.x + sizeA.width;
        const topA = posA.y;
        const bottomA = posA.y + sizeA.height;

        const leftB = posB.x;
        const rightB = posB.x + sizeB.width;
        const topB = posB.y;
        const bottomB = posB.y + sizeB.height;

        return (
            leftA < rightB &&
            rightA > leftB &&
            topA < bottomB &&
            bottomA > topB
        );
    }

    // Checks Player vs All Enemies; applies damage with invincibility frames
    public static checkPlayerEnemyCollisions(world: World): boolean {
        const players = world.getEntitiesWith('PlayerInput', 'Position', 'Size', 'Health');
        const enemies = world.getEntitiesWith('AI', 'Position', 'Size'); // Any entity with AI is an enemy
        
        for (const pEntity of players) {
            const pPos = world.getComponent<Position>(pEntity, 'Position')!;
            const pSize = world.getComponent<Size>(pEntity, 'Size')!;
            const pHealth = world.getComponent<Health>(pEntity, 'Health')!;

            for (const eEntity of enemies) {
                const ePos = world.getComponent<Position>(eEntity, 'Position')!;
                const eSize = world.getComponent<Size>(eEntity, 'Size')!;

                if (this.checkOverlap(pPos, pSize, ePos, eSize)) {
                    if (pHealth.invincibilityTimer <= 0) {
                        pHealth.current -= 1;
                        pHealth.invincibilityTimer = INVINCIBILITY_DURATION;
                    }
                    break; // Only take damage from 1 enemy per frame
                }
            }
            return pHealth.current <= 0;
        }
        return false;
    }
    
    // Also we update health timers here as a convenient health system
    public static updateHealthTimers(world: World, dt: number): void {
        const entities = world.getEntitiesWith('Health');
        for (const entity of entities) {
            const h = world.getComponent<Health>(entity, 'Health')!;
            if (h.invincibilityTimer > 0) {
                h.invincibilityTimer = Math.max(0, h.invincibilityTimer - dt * 1000);
            }
        }
    }
}
