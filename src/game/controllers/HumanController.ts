import type { Controller } from './Controller';
import { InputHandler } from './InputHandler';
import { Player } from '../Player';
import { Vector2 } from 'three';

enum ServeState {
    IDLE,
    AWAITING_TOSS,
    TOSSING,
}

export class HumanController implements Controller {
    private input: InputHandler;
    private serveState: ServeState = ServeState.IDLE;

    constructor() {
        this.input = InputHandler.getInstance();
    }

    public update(player: Player, ball: Ball): void {
        // Update serve state based on ball status
        if (ball.status === 8 && this.serveState === ServeState.IDLE) {
            this.serveState = ServeState.AWAITING_TOSS;
        } else if (ball.status !== 8 && ball.status !== 6 && ball.status !== 7) {
            // If ball is in play or dead, reset serve state
            this.serveState = ServeState.IDLE;
        }

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
        switch (this.serveState) {
            case ServeState.AWAITING_TOSS:
                if (this.input.isMouseButtonDown(0)) {
                    if (player.tossBall(ball)) {
                        this.serveState = ServeState.TOSSING;
                    }
                }
                break;

            case ServeState.TOSSING:
                // While tossing, the player can aim. This will be implemented later.
                if (this.input.isMouseButtonUp(0)) {
                    // Set power and spin for the serve.
                    // This is still simplified. A full implementation would use mouse
                    // movement and timing to determine these values.
                    player.power = 5;
                    player.spin.set(0, 0.5); // Some topspin

                    player.startSwing(player.power, ball);
                    this.serveState = ServeState.IDLE; // Reset after hitting
                }
                break;

            case ServeState.IDLE:
                // This is where the regular rally swing logic will go.
                // For now, we'll keep the simplified swing for rallies.
                if (this.input.isMouseButtonDown(0)) {
                    if (player.swing === 0) {
                        player.spin.set(0.5, 0.5);
                        player.startSwing(8, ball);
                    }
                }
                break;
        }

        // Space bar to change serve type (as in original)
        if (this.input.isKeyPressed(' ')) {
            player.changeServeType();
        }
    }
}
