import type { Controller } from './Controller';
import { Player } from '../Player';
import { Ball } from '../Ball';
import { Vector3 } from 'three';
import * as CONST from '../constants';

export class ComController implements Controller {
    public update(player: Player, ball: Ball): void {
        // 1. Set the aiming target (intention)
        // Aim for the general center of the opponent's court
        player.target.set(0, -CONST.TABLELENGTH / 4, CONST.TABLEHEIGHT);

        // 2. Decide movement target
        const targetPos = new Vector3();
        // The ball is on the AI's side of the table if its Y position is positive.
        const isBallOnAISide = ball.position.y > 0;

        if (player.canHitBall(ball) || (isBallOnAISide && ball.velocity.y > 0)) {
            // Intercept the ball
            targetPos.x = ball.position.x;
            // Try to position slightly behind the ball's current y to prepare for a hit
            targetPos.y = ball.position.y + 0.3; // Player is at positive Y, so add to be "behind"
        } else {
            // Return to a default ready position
            targetPos.x = 0;
            targetPos.y = CONST.TABLELENGTH / 2 + 0.5; // A bit behind the baseline
        }

        // 3. Execute movement
        const moveVector = new Vector3().subVectors(targetPos, player.position);
        // Use a proportional controller for smoother movement
        player.velocity.x = moveVector.x * 2.0;
        player.velocity.y = moveVector.y * 2.0;

        // Clamp velocity to max run speed
        if (player.velocity.length() > player.RUNSPEED) {
            player.velocity.normalize().multiplyScalar(player.RUNSPEED);
        }

        // 4. Decide when to swing
        if (player.canHitBall(ball)) {
            const distance = player.position.distanceTo(ball.position);
            // Swing if ball is in front and close enough
            if (distance < 1.0 && player.position.y > ball.position.y && player.swing === 0) {
                player.spin.set((Math.random() - 0.5), (Math.random() - 0.5)); // some random spin
                player.startSwing(8, ball);
            }
        }
    }
}
