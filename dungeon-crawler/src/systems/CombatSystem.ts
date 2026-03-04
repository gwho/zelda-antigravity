import { Player } from '../entities/Player';
import { Entity } from '../entities/Entity';
import { Direction } from '../types';
import { TILE_SIZE } from '../constants';

export class CombatSystem {

    public static processAttacks(player: Player, enemies: Entity[], handleKill: (enemy: Entity) => void): void {
        if (player.wantToAttack) {
            player.wantToAttack = false;

            // Attack hits the tile exactly 1 grid space in front of the player's facing direction
            let targetGridX = player.getGridX();
            let targetGridY = player.getGridY();

            switch (player.facing) {
                case Direction.UP: targetGridY -= 1; break;
                case Direction.DOWN: targetGridY += 1; break;
                case Direction.LEFT: targetGridX -= 1; break;
                case Direction.RIGHT: targetGridX += 1; break;
            }

            // Create a pseudo-entity representing the bounds of the attack to check overlap
            // We use a small rectangle centered on that tile
            const attackBounds = {
                left: targetGridX * TILE_SIZE + TILE_SIZE * 0.1,
                right: targetGridX * TILE_SIZE + TILE_SIZE * 0.9,
                top: targetGridY * TILE_SIZE + TILE_SIZE * 0.1,
                bottom: targetGridY * TILE_SIZE + TILE_SIZE * 0.9
            };

            for (const enemy of enemies) {
                if (!enemy.isActive) continue;

                const eb = enemy.getBounds();

                // Check overlap between attackBounds and enemy bounds
                const overlaps = (
                    attackBounds.left < eb.right &&
                    attackBounds.right > eb.left &&
                    attackBounds.top < eb.bottom &&
                    attackBounds.bottom > eb.top
                );

                if (overlaps) {
                    handleKill(enemy);
                }
            }
        }
    }
}
