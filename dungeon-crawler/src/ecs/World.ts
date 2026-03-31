export class World {
    private nextEntityId: number = 1;
    private entities: Set<number> = new Set();
    
    // Store components by component name (string) then entity (number)
    private componentMap: Record<string, Record<number, any>> = {};

    public createEntity(): number {
        const id = this.nextEntityId++;
        this.entities.add(id);
        return id;
    }

    public destroyEntity(entity: number): void {
        this.entities.delete(entity);
        for (const compName of Object.keys(this.componentMap)) {
            delete this.componentMap[compName][entity];
        }
    }

    public getEntities(): number[] {
        return Array.from(this.entities);
    }

    public addComponent<T>(entity: number, name: string, data: T): void {
        if (!this.componentMap[name]) {
            this.componentMap[name] = {};
        }
        this.componentMap[name][entity] = data;
    }

    public removeComponent(entity: number, name: string): void {
        if (this.componentMap[name]) {
            delete this.componentMap[name][entity];
        }
    }

    public getComponent<T>(entity: number, name: string): T | undefined {
        if (!this.componentMap[name]) return undefined;
        return this.componentMap[name][entity] as T;
    }

    public hasComponent(entity: number, name: string): boolean {
        if (!this.componentMap[name]) return false;
        return this.componentMap[name][entity] !== undefined;
    }

    // Query for entities that have ALL specified components
    public getEntitiesWith(...components: string[]): number[] {
        return Array.from(this.entities).filter(entity => {
            return components.every(comp => this.hasComponent(entity, comp));
        });
    }

    public cleanupDestroyed(): void {
        // In a more complex ECS, we might defer destruction until end of frame.
        // For our minimal engine, destroyEntity handles it immediately.
    }
}
