import { TileType } from '../types';
import { levels, type LevelData } from './levels';

export class LevelManager {
    public currentLevelIndex: number = 0;
    public currentGrid: TileType[][] = [];
    public spawnX: number = 0;
    public spawnY: number = 0;

    constructor() {
        this.loadLevel(0);
    }

    public loadLevel(index: number): void {
        this.currentLevelIndex = index;
        const levelData: LevelData = levels[this.currentLevelIndex];

        // Deep copy the grid so modifications (like removing spawn markers) 
        // don't corrupt the base level data for restarts.
        this.currentGrid = levelData.grid.map(row => [...row]);
        this.spawnX = levelData.spawnX;
        this.spawnY = levelData.spawnY;
    }

    public getTile(x: number, y: number): TileType {
        if (x < 0 || x >= 12 || y < 0 || y >= 10) {
            return TileType.EMPTY;
        }
        return this.currentGrid[y][x];
    }

    public setTile(x: number, y: number, type: TileType): void {
        if (x >= 0 && x < 12 && y >= 0 && y < 10) {
            this.currentGrid[y][x] = type;
        }
    }

    // Check if the tile is a solid wall or obstacle
    public isSolid(x: number, y: number): boolean {
        const type = this.getTile(x, y);
        const solids: TileType[] = [
            TileType.WALL_TOP, TileType.WALL_BOTTOM, TileType.WALL_LEFT, TileType.WALL_RIGHT,
            TileType.CORNER_TL, TileType.CORNER_TR, TileType.CORNER_BL, TileType.CORNER_BR,
            TileType.FIRE_POT, TileType.LANTERN, TileType.EMPTY
        ];
        return solids.includes(type);
    }

    public get totalLevels(): number {
        return levels.length;
    }
}
