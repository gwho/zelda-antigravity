import { Direction, EntityType } from '../types';

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Velocity {
    dx: number;
    dy: number;
}

export interface PlayerInput {
    facing: Direction;
    nextMoveTimer: number;
}

export interface AI {
    type: 'patrol' | 'wander';
    timer: number;
    movingForward: boolean;
    dx: number;
    dy: number;
    startX: number;
    startY: number;
    patrolRadius: number;
}

export interface Health {
    current: number;
    max: number;
    invincibilityTimer: number;
}

export interface AttackIntent {
    timer: number;
    wantToAttack: boolean;
    inAnim: boolean;
    animTimer: number;
}

export interface Renderable {
    type: EntityType;
    zIndex: number;
}

export interface Collider {
    isSolid: boolean;
}
