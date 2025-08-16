import type { Controller } from './Controller';
import { Player } from '../Player';
import { Ball } from '../Ball';

export class ComController implements Controller {
    public update(player: Player, ball: Ball): void {
        // Simple AI logic

        // 1. Move to intercept the ball
        const targetPos = ball.position;
        const currentPos = player.position;
        const diff = targetPos.clone().sub(currentPos);

        // A simple proportional controller to move the player
        player.velocity.x = diff.x * 1.5;
        player.velocity.y = diff.y * 0.8; // Move less aggressively on y-axis

        // Clamp velocity to a max speed
        const speed = player.velocity.length();
        if (speed > player.RUNSPEED) {
            player.velocity.multiplyScalar(player.RUNSPEED / speed);
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
