import * as THREE from 'three';
import { Player } from '../Player';

export class PlayerView {
    public mesh: THREE.Mesh;
    private player: Player;

    constructor(player: Player) {
        this.player = player;

        // Using a capsule to represent the player
        const geometry = new THREE.CapsuleGeometry(0.3, 1.0, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);
    }

    public update() {
        this.mesh.position.copy(this.player.position);

        // We can add rotation or other updates here later
        // For example, looking at the ball
        // this.mesh.lookAt(ball.position);
    }

    public addToScene(scene: THREE.Scene) {
        scene.add(this.mesh);
    }
}
