import type { Controller } from './Controller';
import { Player } from '../Player';
import { Ball } from '../Ball';

export class ComController implements Controller {
    public update(player: Player, ball: Ball): void {
        // Simple AI logic

        // 1. Move to intercept the ball on the X-axis
        const targetX = ball.position.x;
        const currentX = player.position.x;
        const dx = targetX - currentX;

        // A simple proportional controller to move the player
        player.velocity.x = dx * 1.5; // The factor 1.5 is arbitrary, adjust for difficulty

        // Clamp velocity to a max speed
        if (Math.abs(player.velocity.x) > player.RUNSPEED) {
            player.velocity.x = Math.sign(player.velocity.x) * player.RUNSPEED;
        }

        // 2. Decide when to swing
        if (player.canHitBall(ball)) {
            // Check if the ball is close enough to hit
            const distance = player.position.distanceTo(ball.position);
            if (distance < 1.0 && player.swing === 0) { // 1.0 is an arbitrary hit radius
                player.spin.set(-0.5, -0.5); // Give it some default spin
                player.startSwing(8, ball);
            }
        }
    }
}
