import { World } from '../ecs/World';
import type { Position, PlayerInput, AttackIntent, Size } from '../ecs/Components';
import { LevelManager } from '../level/LevelManager';
import { InputManager } from '../input/InputManager';
import { Direction } from '../types';
import { TILE_SIZE, PLAYER_ATTACK_COOLDOWN, PLAYER_ATTACK_DURATION } from '../constants';

export class PlayerControlSystem {
    private static MOVEMENT_COOLDOWN = 150;

    public static update(world: World, dt: number, input: InputManager, level: LevelManager): void {
        const players = world.getEntitiesWith('PlayerInput', 'Position', 'AttackIntent', 'Size');

        for (const entity of players) {
            const inputComp = world.getComponent<PlayerInput>(entity, 'PlayerInput')!;
            const pos = world.getComponent<Position>(entity, 'Position')!;
            const attack = world.getComponent<AttackIntent>(entity, 'AttackIntent')!;
            const size = world.getComponent<Size>(entity, 'Size')!;

            // Update timers
            if (attack.timer > 0) attack.timer -= dt * 1000;
            if (attack.animTimer > 0) {
                attack.animTimer -= dt * 1000;
                if (attack.animTimer <= 0) attack.inAnim = false;
            }
            if (inputComp.nextMoveTimer > 0) inputComp.nextMoveTimer -= dt * 1000;

            if (input.isJustPressed('attack') && attack.timer <= 0) {
                attack.wantToAttack = true;
                attack.timer = PLAYER_ATTACK_COOLDOWN;
                attack.inAnim = true;
                attack.animTimer = PLAYER_ATTACK_DURATION;
            }

            if (inputComp.nextMoveTimer > 0) continue;

            let dx = 0; let dy = 0;
            let newFacing = inputComp.facing;

            if (input.isDown('up')) { dy = -1; newFacing = Direction.UP; }
            else if (input.isDown('down')) { dy = 1; newFacing = Direction.DOWN; }
            else if (input.isDown('left')) { dx = -1; newFacing = Direction.LEFT; }
            else if (input.isDown('right')) { dx = 1; newFacing = Direction.RIGHT; }

            if (dx !== 0 || dy !== 0) {
                inputComp.facing = newFacing;
                const currentGridX = Math.round(pos.x / TILE_SIZE);
                const currentGridY = Math.round(pos.y / TILE_SIZE);

                const targetX = currentGridX + dx;
                const targetY = currentGridY + dy;

                if (!level.isSolid(targetX, targetY)) {
                    // Snap position
                    pos.x = targetX * TILE_SIZE + (TILE_SIZE - size.width) / 2;
                    pos.y = targetY * TILE_SIZE + (TILE_SIZE - size.height) / 2;
                    inputComp.nextMoveTimer = PlayerControlSystem.MOVEMENT_COOLDOWN;
                }
            }
        }
    }
}
