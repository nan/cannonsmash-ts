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
    public lastHitBy: any = null; // Using any to avoid circular deps for now

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

    public hit(v: Vector3, spin: Vector2, player: any): boolean {
        // Sound.TheSound().Play(SOUND_RACKET, this.position);
        this.lastHitBy = player;
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

    // --- Ported from C++ ball.cpp ---

    private safeLog(f: number): number {
        if (f <= 0) {
            console.warn(`log(f) called with f=${f}`);
            return -10e10;
        }
        return Math.log(f);
    }

    private getTimeToReachTarget(target: Vector2, velocity: number, spin: Vector2, v: Vector3): number {
        if (spin.x === 0.0) {
            v.x = target.x / target.length() * velocity;
            v.y = target.y / target.length() * velocity;

            if (1 - CONST.PHY * target.length() / velocity < 0) {
                return 100000;
            }
            return -this.safeLog(1 - CONST.PHY * target.length() / velocity) / CONST.PHY;
        } else {
            const theta = Math.asin(target.length() * spin.x / (2 * velocity));
            v.x = target.x / target.length() * velocity * Math.cos(-theta) - target.y / target.length() * velocity * Math.sin(-theta);
            v.y = target.x / target.length() * velocity * Math.sin(-theta) + target.y / target.length() * velocity * Math.cos(-theta);

            if (1 - 2 * CONST.PHY / spin.x * theta < 0) {
                return 100000;
            }
            return -this.safeLog(1 - 2 * CONST.PHY / spin.x * theta) / CONST.PHY;
        }
    }

    private getTimeToReachY(targetX: { value: number }, targetY: number, x: Vector2, spin: Vector2, v: Vector3): number {
        const tempV = v.clone();
        tempV.z = 0.0;
        const target = new Vector2();

        if (spin.x === 0.0) {
            target.x = x.x + tempV.x / tempV.y * (targetY - x.y);
            target.y = targetY;
            targetX.value = target.x;
            return this.getTimeToReachTarget(target.sub(x), tempV.length(), spin, tempV);
        } else {
            const centerX = new Vector2(x.x - tempV.y / spin.x, x.y + tempV.x / spin.x);
            const radiusSq = tempV.lengthSq() / (spin.x * spin.x);
            const distSq = (targetY - centerX.y) ** 2;

            if (radiusSq < distSq) return 100000; // Cannot reach

            const xOffset = Math.sqrt(radiusSq - distSq);
            const yTarget1 = new Vector2(centerX.x + xOffset, targetY);
            const yTarget2 = new Vector2(centerX.x - xOffset, targetY);

            const ip1 = new Vector2().subVectors(x, centerX).dot(new Vector2().subVectors(yTarget1, centerX));
            const ip2 = new Vector2().subVectors(x, centerX).dot(new Vector2().subVectors(yTarget2, centerX));

            if (ip1 > ip2) {
                target.copy(yTarget1);
            } else {
                target.copy(yTarget2);
            }
            targetX.value = target.x;
            return this.getTimeToReachTarget(target.sub(x), tempV.length(), spin, tempV);
        }
    }


    private getVz0ToReachTarget(targetHeight: number, spin: Vector2, t: number): number {
        if (t !== 0.0) {
            return (CONST.PHY * targetHeight + CONST.GRAVITY(spin.y) * t) / (1 - Math.exp(-CONST.PHY * t)) - CONST.GRAVITY(spin.y) / CONST.PHY;
        } else {
            return -targetHeight;
        }
    }

    public targetToV(target: Vector2, level: number, spin: Vector2, v: Vector3, vMin: number, vMax: number): boolean {
        let vCurrent = 0;
        const x = new Vector2(this.position.x, this.position.y);

        if (target.y * this.position.y >= 0) {
            const t2 = this.getTimeToReachTarget(target.clone().sub(x), vMax * level * 0.5, spin, v);
            v.z = this.getVz0ToReachTarget(CONST.TABLEHEIGHT - this.position.z, spin, t2);
            return true;
        }

        while (vMax - vMin > 0.001) {
            vCurrent = (vMin + vMax) / 2;
            const t2 = this.getTimeToReachTarget(target.clone().sub(x), vCurrent, spin, v);
            const targetX = { value: 0 };
            const t1 = this.getTimeToReachY(targetX, 0, x, spin, v);
            v.z = this.getVz0ToReachTarget(CONST.TABLEHEIGHT - this.position.z, spin, t2);
            const z1 = -(v.z + CONST.GRAVITY(spin.y) / CONST.PHY) * Math.exp(-CONST.PHY * t1) / CONST.PHY - CONST.GRAVITY(spin.y) * t1 / CONST.PHY +
                (v.z + CONST.GRAVITY(spin.y) / CONST.PHY) / CONST.PHY;

            if (z1 < CONST.TABLEHEIGHT + CONST.NETHEIGHT - this.position.z) {
                vMax = vCurrent;
            } else {
                vMin = vCurrent;
            }
        }

        vCurrent *= level;
        const t2 = this.getTimeToReachTarget(target.clone().sub(x), vCurrent, spin, v);
        v.z = this.getVz0ToReachTarget(CONST.TABLEHEIGHT - this.position.z, spin, t2);

        return true;
    }

    public targetToVS(target: Vector2, level: number, spin: Vector2, v: Vector3): boolean {
        const bound = new Vector2();
        const x = new Vector2(this.position.x, this.position.y);
        const tmpV = new Vector3(0, 0, 0);

        for (bound.y = -CONST.TABLELENGTH / 2; bound.y < CONST.TABLELENGTH / 2; bound.y += CONST.TICK) {
            if (bound.y * this.position.y <= 0.0) continue;

            let vMin = 0.1;
            let vMax = 30.0;
            let vXY = 0;
            let z = 0;

            while (vMax - vMin > 0.001) {
                vXY = (vMin + vMax) / 2;
                let xMin = -CONST.TABLEWIDTH / 2;
                let xMax = CONST.TABLEWIDTH / 2;

                while (xMax - xMin > 0.001) {
                    bound.x = (xMin + xMax) / 2;
                    const sCurrent = spin.clone();
                    const vCurrent = new Vector3();
                    const t2 = this.getTimeToReachTarget(bound.clone().sub(x), vXY, sCurrent, vCurrent);
                    const rotVx = vCurrent.x * Math.cos(sCurrent.x * t2) - vCurrent.y * Math.sin(sCurrent.x * t2);
                    const rotVy = vCurrent.x * Math.sin(sCurrent.x * t2) + vCurrent.y * Math.cos(sCurrent.x * t2);
                    vCurrent.x = rotVx;
                    vCurrent.y = rotVy;
                    vCurrent.multiplyScalar(Math.exp(-CONST.PHY * t2));
                    sCurrent.x *= Math.exp(-CONST.PHY * t2);
                    const vCurrentXY = vCurrent.length();
                    if (vCurrentXY > 0) {
                       vCurrent.x += vCurrent.x / vCurrentXY * sCurrent.y * 0.8;
                       vCurrent.y += vCurrent.y / vCurrentXY * sCurrent.y * 0.8;
                    }
                    sCurrent.x *= 0.95;
                    sCurrent.y *= 0.8;
                    const targetX = { value: 0 };
                    this.getTimeToReachY(targetX, target.y, bound, sCurrent, vCurrent);

                    if (targetX.value < target.x) {
                        xMin = bound.x;
                    } else {
                        xMax = bound.x;
                    }
                }

                const vCurrent = new Vector3();
                const t2 = this.getTimeToReachTarget(bound.clone().sub(x), vXY, spin.clone(), vCurrent);
                vCurrent.z = this.getVz0ToReachTarget(CONST.TABLEHEIGHT - this.position.z, spin, t2);
                vCurrent.z = (vCurrent.z + CONST.GRAVITY(spin.y) / CONST.PHY) * Math.exp(-CONST.PHY * t2) - CONST.GRAVITY(spin.y) / CONST.PHY;
                vCurrent.z *= -CONST.TABLE_E;
                const spinAfterBounce = spin.clone();
                spinAfterBounce.y *= 0.8;
                const targetX = { value: 0 };
                const t1 = this.getTimeToReachY(targetX, target.y, bound, spinAfterBounce, vCurrent);
                z = -(vCurrent.z + CONST.GRAVITY(spinAfterBounce.y) / CONST.PHY) * Math.exp(-CONST.PHY * t1) / CONST.PHY
                    - CONST.GRAVITY(spinAfterBounce.y) / CONST.PHY * t1
                    + (vCurrent.z + CONST.GRAVITY(spinAfterBounce.y) / CONST.PHY) / CONST.PHY;

                if (z > 0) {
                    vMax = vXY;
                } else {
                    vMin = vXY;
                }
            }

            if (Math.abs(z) > 0.01) continue;

            const vCurrent = new Vector3();
            const t2 = this.getTimeToReachTarget(bound.clone().sub(x), vXY, spin.clone(), vCurrent);
            vCurrent.z = this.getVz0ToReachTarget(CONST.TABLEHEIGHT - this.position.z, spin, t2);
            vCurrent.z = (vCurrent.z + CONST.GRAVITY(spin.y) / CONST.PHY) * Math.exp(-CONST.PHY * t2) - CONST.GRAVITY(spin.y) / CONST.PHY;
            vCurrent.z *= -CONST.TABLE_E;
            const spinAfterBounce = spin.clone();
            spinAfterBounce.y *= 0.8;
            const targetX = { value: 0 };
            const t3 = this.getTimeToReachY(targetX, 0, bound, spinAfterBounce, vCurrent);
            z = -(vCurrent.z + CONST.GRAVITY(spinAfterBounce.y) / CONST.PHY) * Math.exp(-CONST.PHY * t3) / CONST.PHY
                - CONST.GRAVITY(spinAfterBounce.y) / CONST.PHY * t3
                + (vCurrent.z + CONST.GRAVITY(spinAfterBounce.y) / CONST.PHY) / CONST.PHY;

            if (z > CONST.NETHEIGHT + (1.0 - level) * 0.1) {
                if (vXY > tmpV.length()) {
                    const t2 = this.getTimeToReachTarget(bound.clone().sub(x), vXY, spin, tmpV);
                    tmpV.z = this.getVz0ToReachTarget(CONST.TABLEHEIGHT - this.position.z, spin, t2);
                }
            }
        }

        v.copy(tmpV);
        return true;
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
            if (tableY < 0) { // My side (player 1's side)
                switch (this.status) {
                    case 2: this.status = 3; break; // Rally ball from P2, now hittable by P1
                    case 4: this.status = 0; break; // P1's serve, now travelling to P2
                    default: this.ballDead();
                }
            } else { // Opponent side (player 2's side)
                switch (this.status) {
                    case 0: this.status = 1; break; // Rally ball from P1, now hittable by P2
                    case 5: this.status = 2; break; // P2's serve, now travelling to P1
                    default: this.ballDead();
                }
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
            PlayGame.getInstance().changeScore(this);
            this.status = -1;
        }
    }

    public reset(): boolean {
        PlayGame.getInstance().resetBall();
        return true;
    }
}
