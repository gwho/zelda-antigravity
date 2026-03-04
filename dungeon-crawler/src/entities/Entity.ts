import { EntityType } from '../types';

export abstract class Entity {
    public id: string;
    public type: EntityType;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public isActive: boolean = true;

    constructor(
        id: string,
        type: EntityType,
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Returns a simple AABB for collision
    public getBounds(): { left: number, right: number, top: number, bottom: number } {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    // Delta time in seconds
    public abstract update(dt: number): void;
}
