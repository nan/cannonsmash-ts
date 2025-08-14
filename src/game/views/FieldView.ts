import * as THREE from 'three';
import * as CONST from '../constants';

export class FieldView {
    public table: THREE.Group;
    public net: THREE.Mesh;

    constructor() {
        this.table = this.createTable();
        this.net = this.createNet();
        this.table.add(this.net);
    }

    private createTable(): THREE.Group {
        const group = new THREE.Group();

        // Table surface
        const surfaceMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 }); // Dark green
        const surfaceGeometry = new THREE.BoxGeometry(CONST.TABLEWIDTH, CONST.TABLELENGTH, CONST.TABLETHICK);
        const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        surface.position.set(0, 0, CONST.TABLEHEIGHT - CONST.TABLETHICK / 2);
        group.add(surface);

        // White lines
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // Center line
        const centerLineGeometry = new THREE.BoxGeometry(0.01, CONST.TABLELENGTH, 0.01);
        const centerLine = new THREE.Mesh(centerLineGeometry, lineMaterial);
        centerLine.position.set(0, 0, CONST.TABLEHEIGHT + 0.001);
        group.add(centerLine);

        // Side lines
        const sideLineGeometry = new THREE.BoxGeometry(CONST.TABLEWIDTH, 0.02, 0.01);
        const sideLine1 = new THREE.Mesh(sideLineGeometry, lineMaterial);
        sideLine1.position.set(0, CONST.TABLELENGTH / 2, CONST.TABLEHEIGHT + 0.001);
        group.add(sideLine1);

        const sideLine2 = sideLine1.clone();
        sideLine2.position.y = -CONST.TABLELENGTH / 2;
        group.add(sideLine2);

        // Edge lines
        const edgeLineGeometry = new THREE.BoxGeometry(0.02, CONST.TABLELENGTH, 0.01);
        const edgeLine1 = new THREE.Mesh(edgeLineGeometry, lineMaterial);
        edgeLine1.position.set(CONST.TABLEWIDTH / 2, 0, CONST.TABLEHEIGHT + 0.001);
        group.add(edgeLine1);

        const edgeLine2 = edgeLine1.clone();
        edgeLine2.position.x = -CONST.TABLEWIDTH / 2;
        group.add(edgeLine2);

        return group;
    }

    private createNet(): THREE.Mesh {
        const netMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const netGeometry = new THREE.PlaneGeometry(CONST.TABLEWIDTH, CONST.NETHEIGHT);
        const net = new THREE.Mesh(netGeometry, netMaterial);
        net.position.set(0, 0, CONST.TABLEHEIGHT + CONST.NETHEIGHT / 2);
        return net;
    }

    public addToScene(scene: THREE.Scene) {
        scene.add(this.table);
    }
}
