import { Vector2 } from 'three';

export class InputHandler {
    private static instance: InputHandler;

    public keys: Map<string, boolean> = new Map();
    public mousePosition: Vector2 = new Vector2();
    public mouseButtons: Map<number, boolean> = new Map(); // 0: left, 1: middle, 2: right

    private constructor() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this), false);
        window.addEventListener('keyup', this.handleKeyUp.bind(this), false);
        window.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
        window.addEventListener('mousedown', this.handleMouseDown.bind(this), false);
        window.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
    }

    public static getInstance(): InputHandler {
        if (!InputHandler.instance) {
            InputHandler.instance = new InputHandler();
        }
        return InputHandler.instance;
    }

    private handleKeyDown(event: KeyboardEvent) {
        this.keys.set(event.key.toLowerCase(), true);
    }

    private handleKeyUp(event: KeyboardEvent) {
        this.keys.set(event.key.toLowerCase(), false);
    }

    private handleMouseMove(event: MouseEvent) {
        this.mousePosition.set(event.clientX, event.clientY);
    }

    private handleMouseDown(event: MouseEvent) {
        this.mouseButtons.set(event.button, true);
    }

    private handleMouseUp(event: MouseEvent) {
        this.mouseButtons.set(event.button, false);
    }

    public isKeyPressed(key: string): boolean {
        return this.keys.get(key.toLowerCase()) || false;
    }

    public isMouseButtonPressed(button: number): boolean {
        return this.mouseButtons.get(button) || false;
    }
}
