export type Action = 'up' | 'down' | 'left' | 'right' | 'attack' | 'restart';

export class InputManager {
    private keys: Map<string, boolean> = new Map();
    private justPressedKeys: Set<string> = new Set();

    // Map physical keys to abstract actions
    private keyMap: Record<string, Action> = {
        'ArrowUp': 'up',
        'KeyW': 'up',
        'ArrowDown': 'down',
        'KeyS': 'down',
        'ArrowLeft': 'left',
        'KeyA': 'left',
        'ArrowRight': 'right',
        'KeyD': 'right',
        'Space': 'attack',
        'KeyR': 'restart'
    };

    constructor() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    private onKeyDown(e: KeyboardEvent): void {
        const action = this.keyMap[e.code];
        if (action && !this.keys.get(action)) {
            this.keys.set(action, true);
            this.justPressedKeys.add(action);
        }

        // Prevent default scrolling for game keys
        if (action || e.code === 'Space' || e.code.startsWith('Arrow')) {
            e.preventDefault();
        }
    }

    private onKeyUp(e: KeyboardEvent): void {
        const action = this.keyMap[e.code];
        if (action) {
            this.keys.set(action, false);
            // We intentionally do not remove from justPressedKeys here.
            // justPressed is consumed by the game loop per-frame.
        }
    }

    public isDown(action: Action): boolean {
        return !!this.keys.get(action);
    }

    public isJustPressed(action: Action): boolean {
        return this.justPressedKeys.has(action);
    }

    // Called at the end of every frame to reset just pressed states
    public update(): void {
        this.justPressedKeys.clear();
    }
}
