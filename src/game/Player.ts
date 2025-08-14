import { Vector2, Vector3 } from 'three';
import * as CONST from './constants';
import { Ball } from './Ball';

// Placeholder for the Controller interface
export interface Controller {
    move(/*...keys, mouse, etc...*/): void;
}

// A swing type definition, ported from the C struct
export interface SwingType {
    type: number;
    toss: number;
    backswing: number;
    hitStart: number;
    hitEnd: number;
    swingEnd: number;
    swingLength: number;
    hitX: number;
    hitY: number;
    tossV: number;
}

/**
 * Player class is a base class of player classes (PenAttack, PenDrive, etc.).
 */
export class Player {
    // From C++ member variables
    public playerType: number;
    public side: number; // 1 or -1

    public position: Vector3;
    public velocity: Vector3;

    public status: number;
    public swing: number;
    public swingType: number;
    public swingSide: boolean; // true for forehand, false for backhand
    public afterSwing: number;
    public swingError: number;

    public target: Vector2;
    public eye: Vector3;
    public lookAt: Vector3;

    public power: number;
    public spin: Vector2;

    public stamina: number;
    public statusMax: number;

    // public view: PlayerView | null = null;
    public controller: Controller | null = null;

    // Parameters from C++ constructor/init
    public RUNSPEED = 2.0;
    public RUNPENALTY = -1;
    public SWINGPENALTY = -1;
    public WALKSPEED = 1.0;
    public WALKBONUS = 1;
    public ACCELLIMIT = CONST.PLAYER_ACCEL_LIMIT;
    public ACCELPENALTY = -1;
    public XDIFFPENALTY_FOREHAND = 0.15;
    public XDIFFPENALTY_BACKHAND = 0.1;
    public MAX_FOREHAND_SPEED = CONST.PLAYER_MAX_FOREHAND_SPEED;
    public MAX_BACKHAND_SPEED = CONST.PLAYER_MAX_BACKHAND_SPEED;
    public FOREHAND_BOUNCE_RATE = 0.6;
    public BACKHAND_BOUNCE_RATE = 0.6;
    public FOREHAND_SPINEFFECT_RATE = 3.0;
    public BACKHAND_SPINEFFECT_RATE = 4.0;
    public DIFF_COEFF = CONST.PLAYER_DIFF_COEFF;
    public AFTERSWING_PENALTY = 1.0;
    public SERVEPARAM = CONST.PLAYER_SERVE_PARAM;

    // Ported from static stype map
    public static swingTypes: Map<number, SwingType> = new Map();

    constructor(side = 1) {
        this.side = side;
        this.playerType = CONST.PLAYER_PROTO;

        this.position = new Vector3(0.0, -CONST.TABLELENGTH / 2 - 0.2, 1.4);
        if (side < 0) {
            this.position.y = -this.position.y;
        }
        this.velocity = new Vector3();

        this.status = 200;
        this.swing = 0;
        this.afterSwing = 0;
        this.swingType = CONST.SWING_NORMAL;
        this.swingSide = true;
        this.swingError = CONST.SWING_PERFECT;

        this.target = new Vector2(0.0, CONST.TABLELENGTH / 16 * 5);
        if (side < 0) {
            this.target.y = -this.target.y;
        }

        this.eye = new Vector3(0.0, -1.0, 0.2);
        if (side < 0) {
            this.eye.y = -this.eye.y;
        }
        this.lookAt = new Vector3(0.0, CONST.TABLELENGTH / 2, CONST.TABLEHEIGHT);
        this.lookAt.y *= this.side;

        this.power = 0;
        this.spin = new Vector2();
        this.stamina = 80.0;
        this.statusMax = 200;

        this.initSwingTypes();
    }

    private initSwingTypes() {
        if (Player.swingTypes.size > 0) return;

        Player.swingTypes.set(CONST.SWING_NORMAL, { type: CONST.SWING_NORMAL, toss: -1, backswing: 10, hitStart: 20, hitEnd: 20, swingEnd: 30, swingLength: 50, hitX: 0.3, hitY: 0.0, tossV: 0.0 });
        Player.swingTypes.set(CONST.SWING_POKE, { type: CONST.SWING_POKE, toss: -1, backswing: 10, hitStart: 20, hitEnd: 20, swingEnd: 30, swingLength: 50, hitX: 0.3, hitY: 0.0, tossV: 0.0 });
        Player.swingTypes.set(CONST.SWING_SMASH, { type: CONST.SWING_SMASH, toss: -1, backswing: 10, hitStart: 20, hitEnd: 20, swingEnd: 30, swingLength: 70, hitX: 0.3, hitY: 0.0, tossV: 0.0 });
        Player.swingTypes.set(CONST.SWING_DRIVE, { type: CONST.SWING_DRIVE, toss: -1, backswing: 10, hitStart: 20, hitEnd: 20, swingEnd: 30, swingLength: 80, hitX: 0.3, hitY: 0.0, tossV: 0.0 });
        Player.swingTypes.set(CONST.SWING_CUT, { type: CONST.SWING_CUT, toss: -1, backswing: 10, hitStart: 20, hitEnd: 20, swingEnd: 30, swingLength: 50, hitX: 0.3, hitY: 0.0, tossV: 0.0 });
        Player.swingTypes.set(CONST.SWING_BLOCK, { type: CONST.SWING_BLOCK, toss: -1, backswing: 5, hitStart: 10, hitEnd: 30, swingEnd: 40, swingLength: 40, hitX: 0.3, hitY: 0.0, tossV: 0.0 });
        Player.swingTypes.set(CONST.SERVE_NORMAL, { type: CONST.SERVE_NORMAL, toss: 1, backswing: 10, hitStart: 20, hitEnd: 20, swingEnd: 30, swingLength: 50, hitX: 0.3, hitY: 0.0, tossV: 2.5 });
        Player.swingTypes.set(CONST.SERVE_POKE, { type: CONST.SERVE_POKE, toss: 20, backswing: 85, hitStart: 100, hitEnd: 100, swingEnd: 115, swingLength: 200, hitX: 0.0, hitY: 0.0, tossV: 4.0 });
        Player.swingTypes.set(CONST.SERVE_SIDESPIN1, { type: CONST.SERVE_SIDESPIN1, toss: 20, backswing: 60, hitStart: 80, hitEnd: 80, swingEnd: 95, swingLength: 150, hitX: 0.0, hitY: 0.0, tossV: 3.2 });
        Player.swingTypes.set(CONST.SERVE_SIDESPIN2, { type: CONST.SERVE_SIDESPIN2, toss: 20, backswing: 80, hitStart: 100, hitEnd: 100, swingEnd: 120, swingLength: 200, hitX: 0.0, hitY: 0.0, tossV: 4.0 });
    }

    public move(ball: Ball, /* keyState, etc. */): boolean {
        const prevV = this.velocity.clone();
        const currentSwing = Player.swingTypes.get(this.swingType);

        if (!currentSwing) {
            this.swing = 0;
            return false;
        }

        // Swing logic
        if (this.swing > 0) {
            if (this.swing > currentSwing.swingEnd && this.afterSwing > 0) {
                this.afterSwing--;
            } else {
                // Simplified swing progression
                this.swing++;
            }
        }

        // Impact
        if (this.swing >= currentSwing.hitStart && this.swing <= currentSwing.hitEnd) {
            this.hitBall(ball);
        }

        // End swing
        if (this.swing === currentSwing.swingLength) {
            this.swing = 0;
            this.swingType = CONST.SWING_NORMAL;
        }

        // Simplified AutoMove
        // this.autoMove(ball);

        // Player movement
        this.position.addScaledVector(this.velocity, CONST.TICK);

        // Simplified boundary checks
        if (Math.abs(this.position.x) > CONST.AREAXSIZE / 2) {
            this.position.x = Math.sign(this.position.x) * CONST.AREAXSIZE / 2;
            this.velocity.x = 0;
        }
        if (Math.abs(this.position.y) > CONST.AREAYSIZE / 2) {
            this.position.y = Math.sign(this.position.y) * CONST.AREAYSIZE / 2;
            this.velocity.y = 0;
        }

        // Controller logic would go here
        this.controller?.move(/*...*/);

        // Status calculations
        if (this.velocity.length() > this.RUNSPEED) this.addStatus(this.RUNPENALTY);
        if (this.swing > currentSwing.backswing) this.addStatus(this.SWINGPENALTY);
        if (this.velocity.length() < this.WALKSPEED) this.addStatus(this.WALKBONUS);
        if (this.velocity.clone().sub(prevV).length() > this.ACCELLIMIT[0]) { // Assuming level 0
            this.addStatus(this.ACCELPENALTY);
        }
        if (ball.status === 8 || ball.status === -1) this.resetStatus();

        return true;
    }

    public hitBall(ball: Ball): boolean {
        // Simplified version of the complex hit logic in C++
        if (this.canHitBall(ball) && Math.abs(this.position.x - ball.position.x) < 0.6) {
            const target = this.target.clone();
            const v = new Vector3();

            // Simplified level and velocity calculation
            const level = (this.power / 20.0) + 0.5;
            const maxVy = this.swingSide ? this.MAX_FOREHAND_SPEED[this.swingType] : this.MAX_BACKHAND_SPEED[this.swingType];

            ball.targetToV(target, level, this.spin, v, 0.1, maxVy);

            this.swingError = CONST.SWING_PERFECT; // Assume perfect for now
            this.afterSwing = 50; // Some penalty
            this.addStatus(-this.afterSwing * 2);

            ball.hit(v, this.spin);
        } else {
            this.swingError = CONST.SWING_MISS;
        }

        this.spin.set(0, 0);
        return true;
    }

    public addStatus(diff: number) {
        this.status += diff;
        if (this.status > this.statusMax) this.status = this.statusMax;
        if (this.status < 1) this.status = 1;
    }

    public resetStatus() {
        this.statusMax = 200;
        this.status = 200;
    }

    public canHitBall(ball: Ball): boolean {
        return (ball.status === 3 && this.side === 1) || (ball.status === 1 && this.side === -1);
    }

    public canServe(ball: Ball): boolean {
        return (ball.status === 6 && this.side === 1) || (ball.status === 7 && this.side === -1);
    }
}

// Simplified version of Ball's TargetToV for Player.ts to compile
declare module './Ball' {
    interface Ball {
        targetToV(target: Vector2, level: number, spin: Vector2, v: Vector3, vMin: number, vMax: number): boolean;
    }
}
