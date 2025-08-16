import { Vector2, Vector3 } from 'three';
import * as CONST from './constants';
import { PlayGame } from './PlayGame';

/**
 * Ball class.
 */
export class Ball {
    public position: Vector3;
    public velocity: Vector3;
    public spin: Vector2;
    public status: number;
    public lastHitBy: any = null;

    constructor(position = new Vector3(), velocity = new Vector3(), spin = new Vector2(), status = -1000) {
        this.position = position.clone();
        this.velocity = velocity.clone();
        this.spin = spin.clone();
        this.status = status;
    }

    public clone(): Ball {
        return new Ball(this.position, this.velocity, this.spin, this.status);
    }

    public move(): boolean {
        if (this.status < 0) {
            this.status--;
        }
        if (this.status < -100 || this.status === 8) {
            this.reset();
            return false;
        }

        const oldPosition = this.position.clone();
        this.applyPhysics(oldPosition, this.velocity.clone(), this.spin.clone());
        const result = this.collisionCheck(oldPosition);

        if (result.event === 'BOUNCE') {
            this.position.copy(result.bouncePos!);
            this.velocity.z *= -CONST.TABLE_E;
            this.spin.x *= 0.95;
            this.spin.y *= 0.8;

            if (result.side < 0) { // My side
                switch (this.status) {
                    case 2: this.status = 3; break;
                    case 4: this.status = 0; break;
                    default: this.ballDead();
                }
            } else { // Opponent side
                switch (this.status) {
                    case 0: this.status = 1; break;
                    case 5: this.status = 2; break;
                    default: this.ballDead();
                }
            }
        } else if (result.event === 'NET') {
            this.velocity.x *= 0.5;
            this.velocity.y *= -0.2;
            this.spin.multiplyScalar(-0.8);
        } else if (result.event === 'OUT') {
            this.ballDead();
        }

        return true;
    }

    private applyPhysics(oldPosition: Vector3, oldVelocity: Vector3, oldSpin: Vector2) {
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
    }

    private collisionCheck(oldPosition: Vector3): { event: 'BOUNCE' | 'NET' | 'OUT' | 'NONE', bouncePos?: Vector3, side: number } {
        let netT = Infinity;
        if (oldPosition.y * this.position.y <= 0.0) {
            const timeToNet = Math.abs(oldPosition.y / ((this.position.y - oldPosition.y) / CONST.TICK));
            if (timeToNet <= CONST.TICK) {
                const zAtNet = oldPosition.z + (this.position.z - oldPosition.z) * timeToNet / CONST.TICK;
                const xAtNet = oldPosition.x + (this.position.x - oldPosition.x) * timeToNet / CONST.TICK;
                if (zAtNet >= CONST.TABLEHEIGHT && zAtNet <= CONST.TABLEHEIGHT + CONST.NETHEIGHT && Math.abs(xAtNet) <= CONST.TABLEWIDTH / 2 + 0.1) {
                    netT = timeToNet;
                }
            }
        }

        let tableT = Infinity;
        let bouncePos = new Vector3();
        if ((oldPosition.z - CONST.TABLEHEIGHT) * (this.position.z - CONST.TABLEHEIGHT) <= 0.0) {
            const timeToTable = Math.abs((oldPosition.z - CONST.TABLEHEIGHT) / ((this.position.z - oldPosition.z) / CONST.TICK));
            if (timeToTable <= CONST.TICK) {
                const yAtTable = oldPosition.y + (this.position.y - oldPosition.y) * timeToTable / CONST.TICK;
                const xAtTable = oldPosition.x + (this.position.x - oldPosition.x) * timeToTable / CONST.TICK;
                if (Math.abs(yAtTable) <= CONST.TABLELENGTH / 2 && Math.abs(xAtTable) <= CONST.TABLEWIDTH / 2) {
                    tableT = timeToTable;
                    bouncePos.set(xAtTable, yAtTable, CONST.TABLEHEIGHT);
                }
            }
        }

        if (netT < tableT) return { event: 'NET', side: 0 };
        if (tableT < netT) return { event: 'BOUNCE', side: Math.sign(bouncePos.y), bouncePos: bouncePos };
        if (Math.abs(this.position.x) > CONST.AREAXSIZE / 2 || Math.abs(this.position.y) > CONST.AREAYSIZE / 2 || this.position.z < 0) {
            return { event: 'OUT', side: 0 };
        }
        return { event: 'NONE', side: 0 };
    }

    public simulateFrame(): { event: 'BOUNCE' | 'NET' | 'OUT' | 'NONE', side: number, bouncePos?: Vector3 } {
        const oldPosition = this.position.clone();
        const oldVelocity = this.velocity.clone();
        const oldSpin = this.spin.clone();
        this.applyPhysics(oldPosition, oldVelocity, oldSpin);
        const result = this.collisionCheck(oldPosition);
        if (result.event === 'BOUNCE') {
            this.position.copy(result.bouncePos!);
            this.velocity.z *= -CONST.TABLE_E;
        }
        return result;
    }

    public hit(v: Vector3, spin: Vector2, player: any): boolean {
        this.lastHitBy = player;
        this.spin.copy(spin);
        this.velocity.copy(v);

        if (this.status === 6) this.status = 4;
        else if (this.status === 7) this.status = 5;
        else if (this.status === 3) this.status = 0;
        else if (this.status === 1) this.status = 2;

        return true;
    }

    public toss(power: number, player: any): boolean {
        this.velocity.z = power;
        this.spin.set(0, 0);
        if (player.side > 0) this.status = 6;
        else this.status = 7;
        return true;
    }

    public warp(position: Vector3, velocity: Vector3, spin: Vector2, status: number): void {
        this.position.copy(position);
        this.velocity.copy(velocity);
        this.spin.copy(spin);
        this.status = status;
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
