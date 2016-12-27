/**
 * Created by rkoch on 12/23/16.
 */
class ParticleGroup{
    constructor(env){
        this.meshList = [];
        this.particles = [];
        this.sumForce = [];
    }

    addParticle(particle){
        this.particles.push(particle);
        this.meshList.push(particle.mesh);
        if (this.particles.length > 1){
            this.sumForce.push(0);
        } else {

        }
        console.log(`sumForce Length: ${this.sumForce.length}`);

    }

    getForceValue(i,j){
        if (i<j){
            // console.log(((j-3)+(i)));
            return this.sumForce[(j-3)+(i)];
        }
        else if (i>j){
            return (this.sumForce[(i-3)+(j)]).multiplyScalar(-1);
        }
        else{
            return new THREE.Vector3();
        }
    }

    updateForce(i, j){
        /*
        |(1,1) (1,2) (1,3) (1,4)|
        |(2,1) (2,2) (2,3) (2,4)|
        |(3,1) (3,2) (3,3) (3,4)|
        |(4,1) (4,2) (4,3) (4,4)|

        [(1,2) (1,3) (1,4) (2,3) (2,4) (3,4)]
         */


        let p1 = this.particles[i-1].position.clone();
        let p2 = this.particles[j-1].position.clone();

        let q1 = this.particles[i-1].charge;
        let q2 = this.particles[j-1].charge;

        let r2 = p1.distanceToSquared(p2);

        // console.log(`force for index ${(j-3+i)} is [${value.x}, ${value.y}, ${value.z}]`);
        this.sumForce[(j-3)+(i)] = p1.sub(p2).normalize().multiplyScalar((q1*q2)/r2);
    }

    calculateForceOn(i){
        let value = new THREE.Vector3();
        for (let x=1; x<=this.particles.length; x++){
            // console.log(i,x);
            value.add(this.getForceValue(i,x));
        }
        // console.log(`Force on ${i} is [${value.x}, ${value.y}, ${value.z}]`);
        return value;
    }

    calculateForceAll(){
        /*
         |(1,1) (1,2) (1,3)|
         |(2,1) (2,2) (2,3)|
         |(3,1) (3,2) (3,3)|

         [(1,2) (1,3) (2,3)]
         */

        for (let i=1; i<this.particles.length; i++){
            for (let j=i+1; j<=this.particles.length; j++){
                // console.log(`calculating force between ${i} and ${j}`);
                this.updateForce(i,j);
            }
        }

        for (let i=0; i<this.particles.length; i++){
            // console.log(`updating force on ${i}`);
            this.particles[i].force = this.calculateForceOn(i+1);
        }

        // console.log(this.sumForce);
    }

    updatePositionAll(){
        for (let x=0; x<this.particles.length; x++){
            this.particles[x].calcAcceleration();
            this.particles[x].calcVelocity(0.5);
            this.particles[x].calcPosition(0.5);
            console.log(`position of ${x} is [${this.particles[x].position.x}, ${this.particles[x].position.y}, ${this.particles[x].position.z}]`);
            this.particles[x].setPosition();
        }
    }
}


class Particle{
    constructor(env, colour=0xffffff, charge=0, position=new THREE.Vector3()){
        this.mass = 1;
        this.charge = charge;
        this.defaultColour = colour;
        this.colour = this.defaultColour;
        this.position = position;
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.force = new THREE.Vector3();
        this.mesh = new THREE.Object3D();
        this.buildObject();
        env.scene.add(this.mesh);
        env.particleGroup.addParticle(this);
        this.mesh.material.color.setHex(this.colour);
    }

    setDefaultColour(){
        this.mesh.material.color.set(this.defaultColour);
    }

    buildObject(){
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        this.mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial( { color: this.colour, wireframe: true} )
        );
        this.mesh.particle = this;
        this.setPosition();


        // this.mesh.add( new THREE.LineSegments(
        //     new THREE.WireframeGeometry(geometry),
        //     new THREE.LineBasicMaterial( {
        //         color: 0xffffff,
        //         transparent: true,
        //         opacity: 0.5
        //     } )
        // ) );
        //
        // this.mesh.add( new THREE.Mesh(
        //     geometry,
        //     new THREE.MeshPhongMaterial( {
        //         color: this.colour,
        //         emissive: 0x072534,
        //         side: THREE.DoubleSide,
        //         shading: THREE.FlatShading
        //     } )
        // ) );
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
        let acceleration = this.acceleration.multiplyScalar(0.5*Math.pow(dt,2));
        let speed = this.velocity.multiplyScalar(dt);
        const x = new THREE.Vector3().addVectors(acceleration, speed);
        console.log(x);
        this.position.add(x);
        console.log(this.position);
    }

    setPosition(){
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        // console.log([this.mesh.position.x, this.mesh.position.y, this.mesh.position.z]);
        // console.log(this.mesh.position.x);
        // console.log(this.position);
    }
}

class Neutron extends Particle{
    constructor(env, position){
        super(env, 0xffa500, 0, position);
    }
}

class Proton extends Particle{
    constructor(env, position){
        super(env, 0x0000ff, 1, position)
    }
}

class Electron extends Particle{
    constructor(env, position){
        super(env, 0x00ff00, -1, position)
    }
}