import * as THREE from 'three';
import { Player } from '../Player';

export class TargetView {
    private mesh: THREE.Mesh;
    private player: Player;

    constructor(player: Player) {
        this.player = player;

        const geometry = new THREE.SphereGeometry(0.05, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
        this.mesh = new THREE.Mesh(geometry, material);
    }

    public addToScene(scene: THREE.Scene): void {
        scene.add(this.mesh);
    }

    public update(): void {
        // Only show the target on the opponent's side of the table
        if (this.player.target.y * this.player.side > 0) {
            this.mesh.position.copy(this.player.target);
            this.mesh.visible = true;
        } else {
            this.mesh.visible = false;
        }
    }
}
