export const TILE_SIZE = 48;
export const GRID_WIDTH = 12; // Adjusted to match the level string length later maybe? Let's stick to 12
export const GRID_HEIGHT = 10;

export const CANVAS_WIDTH = GRID_WIDTH * TILE_SIZE;
export const CANVAS_HEIGHT = GRID_HEIGHT * TILE_SIZE;

// Speeds
export const PLAYER_ATTACK_COOLDOWN = 300; // ms
export const PLAYER_ATTACK_DURATION = 500; // ms
export const PATROL_SPEED = 2.0; // grid tiles per second or absolute speed? Usually absolute relative to delta
export const WANDER_SPEED = 1.5;

// Colors
export const COLORS = {
    PLAYER: '#4CAF50', // Green
    PATROL_ENEMY: '#F44336', // Red
    WANDER_ENEMY: '#9C27B0', // Purple
    ATTACK: '#FFEB3B', // Yellow
    WALL: '#424242', // Dark Grey
    FLOOR: '#BCAAA4', // Light Brown/Grey
    DOOR: '#8BC34A', // Light Green
    OBSTACLE: '#795548', // Brown
    TEXT: '#FFFFFF'
};
