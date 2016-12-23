/**
 * Created by rkoch on 12/23/16.
 */
class ParticleGroup{
    constructor(env){
        this.particles = [];
        this.sumForce = [];
    }

    addPatricle(particle){
        this.particles.push(particle);
    }

    removeParticle(){

    }

    updateForce(i, j, value){
        /*
        |(1,1) (1,2) (1,3) (1,4)|
        |(2,1) (2,2) (2,3) (2,4)|
        |(3,1) (3,2) (3,3) (3,4)|
        |(4,1) (4,2) (4,3) (4,4)|

        [(1,2) (1,3) (2,3)]
         */

        return this.sumForce[(j-1)+(i-1)];
    }
}


class Particle{
    constructor(env){
        this.mass = 1;
        this.charge = 0;
        this.colour = 0xffffff;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.force = new THREE.Vector3();
        this.mesh = new THREE.Object3D();
        this.buildObject();
        env.scene.add(this.mesh);
        env.particles.push(this);
    }

    buildObject(){
        const geometry = new THREE.SphereGeometry(1, 32, 32);

        this.mesh.add( new THREE.LineSegments(
            new THREE.WireframeGeometry(geometry),
            new THREE.LineBasicMaterial( {
                color: 0xffffff,
                transparent: true,
                opacity: 0.5
            } )
        ) );

        this.mesh.add( new THREE.Mesh(
            geometry,
            new THREE.MeshPhongMaterial( {
                color: this.colour,
                emissive: 0x072534,
                side: THREE.DoubleSide,
                shading: THREE.FlatShading
            } )
        ) );
    }

    calcForce(){
        this.force.copy(new THREE.Vector3(1,1,1))
    }

    calcAcceleration(){
        // a = F/m
        this.acceleration.copy(this.force.divideScalar(this.mass));
    }

    calcVelocity(dt){
        this.velocity.add(this.acceleration.multiplyScalar(dt));
    }

    calcPosition(dt){
        let acceleration = this.acceleration.multiplyScalar(0.5*dt);
        let speed = this.velocity.multiplyScalar(dt);
        this.position.add(new THREE.Vector3().addVectors(acceleration, speed));
    }

    setPosition(){
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        console.log(this.mesh.position.x);
        // console.log(this.position);
    }
}

class Neutron extends Particle{
    constructor(env){
        super(env);
        this.colour = 0xffa500;
        this.mesh.children[1].material.color.setHex(this.colour);
    }
}