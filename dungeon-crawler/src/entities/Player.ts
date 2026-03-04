import { Entity } from './Entity';
import { EntityType, Direction } from '../types';
import { TILE_SIZE, PLAYER_ATTACK_COOLDOWN, PLAYER_ATTACK_DURATION } from '../constants';
import { InputManager } from '../input/InputManager';
import { LevelManager } from '../level/LevelManager';

export class Player extends Entity {
    public facing: Direction = Direction.RIGHT;
    public attackTimer: number = 0;
    public inAttackAnimation: boolean = false;
    public attackAnimationTimer: number = 0;
    public wantToAttack: boolean = false;

    // Abstract grid coords vs continuous pixel coords. 
    // Player x,y in Entity are absolute pixels, we snap it.

    private nextMoveTimer: number = 0; // Prevent hyperspeed moving
    private MOVEMENT_COOLDOWN = 150; // ms per grid hop

    constructor(x: number, y: number) {
        // Dimensions are a bit smaller than tile for aesthetics/collision padding
        super('player', EntityType.PLAYER, x, y, TILE_SIZE * 0.8, TILE_SIZE * 0.8);
    }

    public getGridX(): number {
        return Math.floor(this.x / TILE_SIZE);
    }

    public getGridY(): number {
        return Math.floor(this.y / TILE_SIZE);
    }

    public override update(dt: number): void {
        // Update attack timers
        if (this.attackTimer > 0) {
            this.attackTimer -= dt * 1000;
        }

        if (this.attackAnimationTimer > 0) {
            this.attackAnimationTimer -= dt * 1000;
            if (this.attackAnimationTimer <= 0) {
                this.inAttackAnimation = false;
            }
        }

        if (this.nextMoveTimer > 0) {
            this.nextMoveTimer -= dt * 1000;
        }

        // Input gathering is handled outside and passed in via Systems or Game.
        // We will just expose intent flags and let Systems resolve collision,
        // OR we can pass World dependencies into the Entity.
        // For simplicity as requested, we'll give player direct access to some state later, 
        // or let generic Systems handle it.
        // Since the prompt asks for player to handle "grid-snapped movement", 
        // we'll provide a handleMove method called by the system.
    }

    public startAttack(): void {
        if (this.attackTimer <= 0) {
            this.wantToAttack = true;
            this.attackTimer = PLAYER_ATTACK_COOLDOWN;
            this.inAttackAnimation = true;
            this.attackAnimationTimer = PLAYER_ATTACK_DURATION;
        }
    }

    public handleInput(input: InputManager, level: LevelManager): void {
        if (input.isJustPressed('attack')) {
            this.startAttack();
        }

        if (this.nextMoveTimer > 0) return; // Still cooling down from last step

        let dx = 0;
        let dy = 0;
        let newFacing = this.facing;

        if (input.isDown('up')) {
            dy = -1;
            newFacing = Direction.UP;
        } else if (input.isDown('down')) {
            dy = 1;
            newFacing = Direction.DOWN;
        } else if (input.isDown('left')) {
            dx = -1;
            newFacing = Direction.LEFT;
        } else if (input.isDown('right')) {
            dx = 1;
            newFacing = Direction.RIGHT;
        }

        if (dx !== 0 || dy !== 0) {
            this.facing = newFacing;
            const currentGridX = Math.round(this.x / TILE_SIZE);
            const currentGridY = Math.round(this.y / TILE_SIZE);

            const targetX = currentGridX + dx;
            const targetY = currentGridY + dy;

            if (!level.isSolid(targetX, targetY)) {
                // Snap position
                this.x = targetX * TILE_SIZE + (TILE_SIZE - this.width) / 2;
                this.y = targetY * TILE_SIZE + (TILE_SIZE - this.height) / 2;
                this.nextMoveTimer = this.MOVEMENT_COOLDOWN;
            }
        }
    }
}
