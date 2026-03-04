import { Entity } from '../entities/Entity';
import { Player } from '../entities/Player';

export class CollisionSystem {

    // Checks AABB collision between two abstract entities
    public static checkOverlap(a: Entity, b: Entity): boolean {
        if (!a.isActive || !b.isActive) return false;

        const boundsA = a.getBounds();
        const boundsB = b.getBounds();

        // Standard AABB intersection
        return (
            boundsA.left < boundsB.right &&
            boundsA.right > boundsB.left &&
            boundsA.top < boundsB.bottom &&
            boundsA.bottom > boundsB.top
        );
    }

    // Checks Player vs All Enemies for game over
    public static checkPlayerEnemyCollisions(player: Player, enemies: Entity[]): boolean {
        // We add slight leniency so pixel perfect grazes don't feel unfair
        // The bounds on Player/Enemies are already 0.8 * TILE_SIZE, which helps.
        for (const enemy of enemies) {
            if (this.checkOverlap(player, enemy)) {
                return true; // Game Over triggered
            }
        }
        return false;
    }
}
