import { Vector2, Vector3 } from 'three';
import * as CONST from './constants';
import { PlayGame } from './PlayGame';
// import { Player } from './Player'; // To be created
// import { BaseView } from './views/BaseView'; // To be created
// import { BallView } from './views/BallView'; // To be created

/**
 * Ball class.
 */
export class Ball {
    public position: Vector3;
    public velocity: Vector3;
    public spin: Vector2;
    public status: number;

    // public view: BallView | null = null;

    constructor(position = new Vector3(), velocity = new Vector3(), spin = new Vector2(), status = -1000) {
        this.position = position.clone();
        this.velocity = velocity.clone();
        this.spin = spin.clone();
        this.status = status;
    }

    public clone(): Ball {
        return new Ball(this.position, this.velocity, this.spin, this.status);
    }

    public init() {
        // this.view = View.CreateView(VIEW_BALL);
        // this.view.init();
        // BaseView.TheView().AddView(this.view);
        return true;
    }

    public move(): boolean {
        const oldPosition = this.position.clone();
        const oldVelocity = this.velocity.clone();
        const oldSpin = this.spin.clone();

        if (this.status < 0) {
            this.status--;
        }
        if (this.status < -100 || this.status === 8) {
            this.reset();
            return false; // No more movement this frame
        }

        const rot = oldSpin.x / CONST.PHY - oldSpin.x / CONST.PHY * Math.exp(-CONST.PHY * CONST.TICK);
        this.velocity.x = (oldVelocity.x * Math.cos(rot) - oldVelocity.y * Math.sin(rot)) * Math.exp(-CONST.PHY * CONST.TICK);
        this.velocity.y = (oldVelocity.x * Math.sin(rot) + oldVelocity.y * Math.cos(rot)) * Math.exp(-CONST.PHY * CONST.TICK);
        this.velocity.z = (oldVelocity.z + CONST.GRAVITY(oldSpin.y) / CONST.PHY) * Math.exp(-CONST.PHY * CONST.TICK) - CONST.GRAVITY(oldSpin.y) / CONST.PHY;

        if (oldSpin.x === 0.0) {
            this.position.x = oldPosition.x + oldVelocity.x / CONST.PHY - oldVelocity.x / CONST.PHY * Math.exp(-CONST.PHY * CONST.TICK);
            this.position.y = oldPosition.y + oldVelocity.y / CONST.PHY - oldVelocity.y / CONST.PHY * Math.exp(-CONST.PHY * CONST.TICK);
        } else {
            const theta = oldSpin.x / CONST.PHY - oldSpin.x / CONST.PHY * Math.exp(-CONST.PHY * CONST.TICK);
            this.position.x = oldVelocity.y / oldSpin.x * Math.cos(theta) - (-oldVelocity.x / oldSpin.x) * Math.sin(theta) + oldPosition.x - oldVelocity.y / oldSpin.x;
            this.position.y = oldVelocity.y / oldSpin.x * Math.sin(theta) + (-oldVelocity.x / oldSpin.x) * Math.cos(theta) + oldPosition.y + oldVelocity.x / oldSpin.x;
        }

        this.position.z = (CONST.PHY * oldVelocity.z + CONST.GRAVITY(oldSpin.y)) / (CONST.PHY * CONST.PHY) - (CONST.PHY * oldVelocity.z + CONST.GRAVITY(oldSpin.y)) / (CONST.PHY * CONST.PHY) * Math.exp(-CONST.PHY * CONST.TICK) - CONST.GRAVITY(oldSpin.y) / CONST.PHY * CONST.TICK + oldPosition.z;

        this.spin.x = oldSpin.x * Math.exp(-CONST.PHY * CONST.TICK);

        this.collisionCheck(oldPosition, oldVelocity, oldSpin);

        return true;
    }

    public hit(v: Vector3, spin: Vector2/*, player: Player*/): boolean {
        // Sound.TheSound().Play(SOUND_RACKET, this.position);
        this.spin.copy(spin);
        this.velocity.copy(v);

        // Status update logic depends on other classes
        if (this.status === 6) this.status = 4;
        else if (this.status === 7) this.status = 5;
        else if (this.status === 3) this.status = 0;
        else if (this.status === 1) this.status = 2;

        return true;
    }

    public toss(power: number, player: Player): boolean {
        this.velocity.z = power;
        this.spin.set(0, 0);

        if (player.side > 0) {
            this.status = 6;
        } else {
            this.status = 7;
        }

        return true;
    }

    public warp(position: Vector3, velocity: Vector3, spin: Vector2, status: number): void {
        this.position.copy(position);
        this.velocity.copy(velocity);
        this.spin.copy(spin);
        this.status = status;
    }

    private collisionCheck(oldPosition: Vector3, oldVelocity: Vector3, oldSpin: Vector2): boolean {
        // This is a complex method that depends on the game state.
        // A full port requires the PlayGame, Control, and Player classes.
        // Here's a simplified version of the logic.

        let netT = Infinity;
        if (oldPosition.y * this.position.y <= 0.0) {
            const timeToNet = Math.abs(oldPosition.y / ((this.position.y - oldPosition.y) / CONST.TICK));
            const zAtNet = oldPosition.z + (this.position.z - oldPosition.z) * timeToNet / CONST.TICK;
            const xAtNet = oldPosition.x + (this.position.x - oldPosition.x) * timeToNet / CONST.TICK;

            if (zAtNet >= CONST.TABLEHEIGHT && zAtNet <= CONST.TABLEHEIGHT + CONST.NETHEIGHT &&
                xAtNet >= -CONST.TABLEWIDTH / 2 - CONST.NETHEIGHT && xAtNet <= CONST.TABLEWIDTH / 2 + CONST.NETHEIGHT) {
                netT = timeToNet;
            }
        }

        let tableT = Infinity;
        if ((oldPosition.z - CONST.TABLEHEIGHT) * (this.position.z - CONST.TABLEHEIGHT) <= 0.0) {
            const timeToTable = Math.abs((oldPosition.z - CONST.TABLEHEIGHT) / ((this.position.z - oldPosition.z) / CONST.TICK));
            const yAtTable = oldPosition.y + (this.position.y - oldPosition.y) * timeToTable / CONST.TICK;
            const xAtTable = oldPosition.x + (this.position.x - oldPosition.x) * timeToTable / CONST.TICK;

            if (timeToTable > 0 && Math.abs(yAtTable) <= CONST.TABLELENGTH / 2 && Math.abs(xAtTable) <= CONST.TABLEWIDTH / 2) {
                tableT = timeToTable;
            }
        }

        if (netT < tableT) { // Hit net
            this.velocity.x *= 0.5;
            this.velocity.y *= -0.2;
            this.spin.multiplyScalar(-0.8);
            this.position.y = this.velocity.y * (CONST.TICK - netT);
        }

        if (tableT < netT) { // Bounce on table
            // Sound.TheSound().Play(SOUND_TABLE, this.position);
            const tableY = oldPosition.y + this.velocity.y * tableT;
            if (tableY < 0) { // My side
                if (this.status === 2) this.status = 3;
                else if (this.status === 4) this.status = 0;
                else this.ballDead();
            } else { // Opponent side
                if (this.status === 0) this.status = 1;
                else if (this.status === 5) this.status = 2;
                else this.ballDead();
            }

            // In the C++ code, there's a lot of complex recalculation of position and velocity
            // for the remainder of the tick after the bounce.
            // For simplicity in this initial port, we'll just do a simple reflection.
            this.velocity.z *= -CONST.TABLE_E;
            this.spin.x *= 0.95;
            this.spin.y *= 0.8;

            // A proper implementation would recalculate the physics for the rest of the tick.
            // This is a placeholder.
            this.position.z = CONST.TABLEHEIGHT + (this.position.z - CONST.TABLEHEIGHT) * -CONST.TABLE_E;
        }

        // Collision with walls
        if (Math.abs(this.position.x) > CONST.AREAXSIZE / 2) this.ballDead();
        if (Math.abs(this.position.y) > CONST.AREAYSIZE / 2) this.ballDead();
        if (this.position.z < 0) this.ballDead();

        return true;
    }

    public ballDead() {
        if (this.status >= 0) {
            // PlayGame.getInstance().changeScore();
            this.status = -1;
        }
    }

    public reset(): boolean {
        PlayGame.getInstance().resetBall();
        return true;
    }
}
