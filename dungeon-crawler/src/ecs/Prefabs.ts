import { World } from './World';
import { EntityType, Direction } from '../types';
import { TILE_SIZE, PLAYER_MAX_HEALTH } from '../constants';
import type {
    Position, Size, Velocity, PlayerInput, AI,
    Health, AttackIntent, Renderable, Collider
} from './Components';

export class Prefabs {
    public static createPlayer(world: World, x: number, y: number): number {
        const entity = world.createEntity();
        
        world.addComponent<Position>(entity, 'Position', { x, y });
        world.addComponent<Size>(entity, 'Size', { width: TILE_SIZE * 0.8, height: TILE_SIZE * 0.8 });
        world.addComponent<Velocity>(entity, 'Velocity', { dx: 0, dy: 0 });
        world.addComponent<PlayerInput>(entity, 'PlayerInput', { facing: Direction.RIGHT, nextMoveTimer: 0 });
        world.addComponent<Health>(entity, 'Health', { current: PLAYER_MAX_HEALTH, max: PLAYER_MAX_HEALTH, invincibilityTimer: 0 });
        world.addComponent<AttackIntent>(entity, 'AttackIntent', { timer: 0, wantToAttack: false, inAnim: false, animTimer: 0 });
        world.addComponent<Renderable>(entity, 'Renderable', { type: EntityType.PLAYER, zIndex: 10 });
        world.addComponent<Collider>(entity, 'Collider', { isSolid: true });
        
        return entity;
    }

    public static createPatrolEnemy(world: World, x: number, y: number): number {
        const entity = world.createEntity();
        
        world.addComponent<Position>(entity, 'Position', { x, y });
        world.addComponent<Size>(entity, 'Size', { width: TILE_SIZE * 0.8, height: TILE_SIZE * 0.8 });
        world.addComponent<Velocity>(entity, 'Velocity', { dx: 0, dy: 0 });
        world.addComponent<AI>(entity, 'AI', { 
            type: 'patrol', 
            timer: 0, 
            movingForward: false, 
            dx: -1,
            dy: 0, 
            startX: x, 
            startY: y, 
            patrolRadius: 0 
        });
        world.addComponent<Health>(entity, 'Health', { current: 1, max: 1, invincibilityTimer: 0 });
        world.addComponent<Renderable>(entity, 'Renderable', { type: EntityType.ENEMY_PATROL, zIndex: 5 });
        world.addComponent<Collider>(entity, 'Collider', { isSolid: true });

        return entity;
    }

    public static createWanderEnemy(world: World, x: number, y: number): number {
        const entity = world.createEntity();
        
        world.addComponent<Position>(entity, 'Position', { x, y });
        world.addComponent<Size>(entity, 'Size', { width: TILE_SIZE * 0.8, height: TILE_SIZE * 0.8 });
        world.addComponent<Velocity>(entity, 'Velocity', { dx: 0, dy: 0 });
        world.addComponent<AI>(entity, 'AI', { 
            type: 'wander', 
            timer: 1 + Math.random() * 4, 
            movingForward: false, 
            dx: 0, 
            dy: -1,
            startX: x, 
            startY: y, 
            patrolRadius: 0 
        });
        world.addComponent<Health>(entity, 'Health', { current: 1, max: 1, invincibilityTimer: 0 });
        world.addComponent<Renderable>(entity, 'Renderable', { type: EntityType.ENEMY_WANDER, zIndex: 5 });
        world.addComponent<Collider>(entity, 'Collider', { isSolid: true });

        return entity;
    }
}
