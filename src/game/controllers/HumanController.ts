import type { Controller } from './Controller';
import { InputHandler } from './InputHandler';
import { Player } from '../Player';
import { Vector2 } from 'three';

export class HumanController implements Controller {
    private input: InputHandler;

    constructor() {
        this.input = InputHandler.getInstance();
    }

    public update(player: Player, ball: Ball): void {
        this.handleMovement(player);
        this.handleActions(player, ball);
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

    private handleActions(player: Player, ball: Ball): void {
        // On mouse down, try to toss or swing.
        if (this.input.isMouseButtonDown(0)) {
            // If ball is ready to be served, this action is a toss.
            // The actual swing will be triggered automatically in Player.move().
            if (ball.status === 8) {
                player.tossBall(ball);
            }
            // Otherwise, it's a regular rally swing.
            else if (player.swing === 0) {
                // Simplified rally swing logic
                player.spin.set(0.5, 0.5);
                player.startSwing(8, ball);
            }
        }

        // Space bar to change serve type (as in original)
        if (this.input.isKeyPressed(' ')) {
            // Only allow changing serve type when waiting to serve
            if (ball.status === 8) {
                player.changeServeType();
            }
        }
    }
}
