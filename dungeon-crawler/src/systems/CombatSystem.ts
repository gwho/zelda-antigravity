import { World } from '../ecs/World';
import type { Position, Size, PlayerInput, AttackIntent, Health } from '../ecs/Components';
import { Direction } from '../types';
import { TILE_SIZE } from '../constants';
import { CollisionSystem } from './CollisionSystem';

export class CombatSystem {

    public static processAttacks(world: World, handleKill: (entity: number) => void): void {
        const players = world.getEntitiesWith('PlayerInput', 'AttackIntent', 'Position');
        const hittable = world.getEntitiesWith('Health', 'Position', 'Size');

        for (const pEntity of players) {
            const intent = world.getComponent<AttackIntent>(pEntity, 'AttackIntent')!;
            if (!intent.wantToAttack) continue;
            
            intent.wantToAttack = false;

            const pPos = world.getComponent<Position>(pEntity, 'Position')!;
            const pInput = world.getComponent<PlayerInput>(pEntity, 'PlayerInput')!;

            let targetGridX = Math.floor(pPos.x / TILE_SIZE);
            let targetGridY = Math.floor(pPos.y / TILE_SIZE);

            switch (pInput.facing) {
                case Direction.UP: targetGridY -= 1; break;
                case Direction.DOWN: targetGridY += 1; break;
                case Direction.LEFT: targetGridX -= 1; break;
                case Direction.RIGHT: targetGridX += 1; break;
            }

            const attackPos: Position = { x: targetGridX * TILE_SIZE + TILE_SIZE * 0.1, y: targetGridY * TILE_SIZE + TILE_SIZE * 0.1 };
            const attackSize: Size = { width: TILE_SIZE * 0.8, height: TILE_SIZE * 0.8 };

            for (const hEntity of hittable) {
                if (pEntity === hEntity) continue; // don't hit yourself

                const hPos = world.getComponent<Position>(hEntity, 'Position')!;
                const hSize = world.getComponent<Size>(hEntity, 'Size')!;
                const hHealth = world.getComponent<Health>(hEntity, 'Health')!;

                if (CollisionSystem.checkOverlap(attackPos, attackSize, hPos, hSize)) {
                    hHealth.current -= 1;
                    if (hHealth.current <= 0) {
                        handleKill(hEntity);
                    }
                }
            }
        }
    }
}
