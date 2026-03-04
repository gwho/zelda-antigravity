export const Direction = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
} as const;
export type Direction = typeof Direction[keyof typeof Direction];

export const TileType = {
    FLOOR: ' ',
    WALL_TOP: 'c',
    WALL_BOTTOM: 'd',
    WALL_LEFT: 'a',
    WALL_RIGHT: 'b',
    CORNER_TL: 'y',
    CORNER_TR: 'w',
    CORNER_BL: 'x',
    CORNER_BR: 'z',
    DOOR_LEFT: '%',
    DOOR_TOP: '^',
    STAIRS: '$',
    LANTERN: ')',
    FIRE_POT: '(',
    SPAWN_PATROL: '*',
    SPAWN_WANDER: '}',
    EMPTY: 'e' // used for outside walls if needed
} as const;
export type TileType = typeof TileType[keyof typeof TileType];

export const EntityType = {
    PLAYER: 'player',
    ENEMY_PATROL: 'enemy_patrol',
    ENEMY_WANDER: 'enemy_wander'
} as const;
export type EntityType = typeof EntityType[keyof typeof EntityType];

export const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
} as const;
export type GameState = typeof GameState[keyof typeof GameState];

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}
