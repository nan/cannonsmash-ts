import * as THREE from 'three';
import { Ball } from '../Ball';
import * as CONST from '../constants';

export class BallView {
    public mesh: THREE.Mesh;
    private ball: Ball;

    constructor(ball: Ball) {
        this.ball = ball;
        const geometry = new THREE.SphereGeometry(CONST.BALL_R, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
    }

    public update() {
        this.mesh.position.copy(this.ball.position);
    }

    public addToScene(scene: THREE.Scene) {
        scene.add(this.mesh);
    }
}
