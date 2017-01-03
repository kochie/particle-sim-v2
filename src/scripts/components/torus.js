/**
 * Created by rkoch on 12/28/16.
 */

class RingGroup{
    constructor(){
        this.meshList = [];
        this.rings = [];
        this.sumForce = [];
    }

    addObject(object){
        this.rings.push(object);
        this.meshList.push(object.mesh);
        if (this.rings.length > 1){
            this.sumForce.push(0);
        } else {

        }
    }
}

class ring{
    constructor(env, position = new THREE.Vector3()){
        this.charge = 1;
        this.mesh = new THREE.Object3D();
        this.position = position;
        this.colour = 0xffff00;


        env.scene.add(this.mesh);
        env.ringGroup.addObject();
    }

    buildObject(){
        const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
        this.mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial( { color: this.colour, wireframe: true} )
        );
        this.mesh.particle = this;
        this.setPosition();
    }

    setPosition(){
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    }
}