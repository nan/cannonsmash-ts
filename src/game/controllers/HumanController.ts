import type { Controller } from './Controller';
import { InputHandler } from './InputHandler';
import { Player } from '../Player';
import { Vector2 } from 'three';

export class HumanController implements Controller {
    private input: InputHandler;

    constructor() {
        this.input = InputHandler.getInstance();
    }

    public update(player: Player): void {
        this.handleMovement(player);
        this.handleActions(player);
    }

    private handleMovement(player: Player): void {
        const speed = player.RUNSPEED;
        let moving = false;

        if (this.input.isKeyPressed('arrowup') || this.input.isKeyPressed('w')) {
            player.velocity.y = speed;
            moving = true;
        }
        if (this.input.isKeyPressed('arrowdown') || this.input.isKeyPressed('s')) {
            player.velocity.y = -speed;
            moving = true;
        }
        if (this.input.isKeyPressed('arrowleft') || this.input.isKeyPressed('a')) {
            player.velocity.x = -speed;
            moving = true;
        }
        if (this.input.isKeyPressed('arrowright') || this.input.isKeyPressed('d')) {
            player.velocity.x = speed;
            moving = true;
        }

        // If no keys are pressed, stop movement
        if (!this.input.isKeyPressed('arrowup') && !this.input.isKeyPressed('w') &&
            !this.input.isKeyPressed('arrowdown') && !this.input.isKeyPressed('s')) {
            player.velocity.y = 0;
        }
        if (!this.input.isKeyPressed('arrowleft') && !this.input.isKeyPressed('a') &&
            !this.input.isKeyPressed('arrowright') && !this.input.isKeyPressed('d')) {
            player.velocity.x = 0;
        }
    }

    private handleActions(player: Player): void {
        // Left mouse button for a basic swing
        if (this.input.isMouseButtonPressed(0)) {
            // This is a simplified action. The original game has a complex system
            // for aiming, setting spin, and power based on mouse movement.

            // For now, just trigger a normal swing.
            // The logic for deciding forehand/backhand and swing type is in Player.ts,
            // which is currently simplified.
            if (player.swing === 0) {
                // Simplified: Set a default spin and power
                player.spin.set(0.5, 0.5);
                player.startSwing(8); // Corresponds to m_pow = 8 in C++
            }
        }

        // Space bar to change serve type (as in original)
        if (this.input.isKeyPressed(' ')) {
            player.changeServeType();
        }
    }
}
