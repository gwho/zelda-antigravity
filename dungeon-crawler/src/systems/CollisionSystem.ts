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

    // Checks Player vs All Enemies; applies damage with invincibility frames
    public static checkPlayerEnemyCollisions(player: Player, enemies: Entity[]): boolean {
        for (const enemy of enemies) {
            if (this.checkOverlap(player, enemy)) {
                player.takeDamage();
                break;
            }
        }
        return player.health <= 0;
    }
}
