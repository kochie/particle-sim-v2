/**
 * Created by rkoch on 12/23/16.
 */

import {
	Vector3,
	Object3D,
	SphereGeometry,
	Mesh,
	MeshBasicMaterial
} from "three";
export class ParticleGroup {
	constructor(env) {
		this.meshList = [];
		this.particles = [];
		this.sumForce = [];
	}

	index(i, j) {
		return (i - 1) * this.particles.length + (j - 1) - i * (i + 1) / 2;
	}

	addParticle(particle) {
		this.particles.push(particle);
		this.meshList.push(particle.mesh);
		if (this.particles.length > 1) {
			this.sumForce.push(0);
		} else {
		}
		// console.log(`sumForce Length: ${this.sumForce.length}`);
	}

	getForceValue(i, j) {
		if (i < j) {
			// console.log(((j-3)+(i)));
			return this.sumForce[this.index(i, j)];
		} else if (i > j) {
			return this.sumForce[this.index(j, i)].clone().multiplyScalar(-1);
		} else {
			return new Vector3();
		}
	}

	updateForce(i, j) {
		/*
        |(1,1) (1,2) (1,3) (1,4) (1,5)|
        |(2,1) (2,2) (2,3) (2,4) (2,5)|
        |(3,1) (3,2) (3,3) (3,4) (3,5)|
        |(4,1) (4,2) (4,3) (4,4) (4,5)|
        |(5,1) (5,2) (5,3) (5,4) (5,5)|

        [(1,2) (1,3) (1,4) (1,5) (2,3) (2,4) (2,5) (3,4) (3,5) (4,5)]
        (i-1)*(n) + (j-1) - i
        1+2+3+4+5
         */

		let p1 = this.particles[i - 1].position.clone();
		let p2 = this.particles[j - 1].position.clone();

		let m1 = this.particles[i - 1].mass;
		let m2 = this.particles[j - 1].mass;

		let q1 = this.particles[i - 1].charge;
		let q2 = this.particles[j - 1].charge;

		let r2 = p1.distanceToSquared(p2);
		// console.log(`force for index ${this.index(i,j)} is [${value.x}, ${value.y}, ${value.z}]`);
		this.sumForce[this.index(i, j)] = p1
			.sub(p2)
			.normalize()
			.multiplyScalar(q1 * q2 / r2);
	}

	calculateForceOn(i, env) {
		let value = new Vector3();
		for (let x = 1; x <= this.particles.length; x++) {
			// console.log(i,x);
			value.add(this.getForceValue(i, x));
		}
		// console.log(this.particles[i-1]);
		let fieldForce = this.particles[i - 1].calcForce(env);
		// console.log(fieldForce);
		value.add(fieldForce);
		// console.log(`Force on ${i} is [${value.x}, ${value.y}, ${value.z}]`);
		return value;
	}

	calculateForceAll(env) {
		/*
         |(1,1) (1,2) (1,3)|
         |(2,1) (2,2) (2,3)|
         |(3,1) (3,2) (3,3)|

         [(1,2) (1,3) (2,3)]
         */

		for (let i = 1; i < this.particles.length; i++) {
			for (let j = i + 1; j <= this.particles.length; j++) {
				this.updateForce(i, j);
			}
		}

		for (let i = 0; i < this.particles.length; i++) {
			this.particles[i].force = this.calculateForceOn(i + 1, env);
		}

		// console.log(this.sumForce);
	}

	updatePositionAll() {
		for (let x = 0; x < this.particles.length; x++) {
			this.particles[x].calcAcceleration();
			this.particles[x].calcPosition(0.1);
			this.particles[x].calcVelocity(0.1);
			// console.log(`position of ${x} is [${this.particles[x].position.x}, ${this.particles[x].position.y}, ${this.particles[x].position.z}]`);
			this.particles[x].setPosition();
		}
	}
}

export class Particle {
	constructor(
		env,
		colour = 0xffffff,
		charge = 0,
		position = new Vector3(),
		velocity = new Vector3()
	) {
		this.mass = 1;
		this.charge = charge;
		this.defaultColour = colour;
		this.colour = this.defaultColour;
		this.position = position;
		this.velocity = velocity;
		this.acceleration = new Vector3();
		this.force = new Vector3();
		this.mesh = new Object3D();
		this.buildObject();
		env.scene.add(this.mesh);
		env.particleGroup.addParticle(this);
		this.mesh.material.color.setHex(this.colour);
	}

	setDefaultColour() {
		this.mesh.material.color.set(this.defaultColour);
	}

	updateVelocity(velocity) {
		this.velocity = velocity;
	}

	buildObject() {
		const geometry = new SphereGeometry(1, 32, 32);
		this.mesh = new Mesh(
			geometry,
			new MeshBasicMaterial({ color: this.colour, wireframe: true })
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

	calcForce(env) {
		// console.log(env.magneticField.getValue(this.position));
		let E = env.electricField.getValue(this.position);
		let B = env.magneticField.getValue(this.position);
		let q = this.charge;
		let v = this.velocity.clone();
		let value = new Vector3()
			.addVectors(E, new Vector3().crossVectors(v, B))
			.multiplyScalar(q);
		// console.log(value);
		return value;
	}

	calcAcceleration() {
		// a = F/m
		this.acceleration.copy(this.force.clone().divideScalar(this.mass));
	}

	calcVelocity(dt) {
		this.velocity.addScaledVector(this.acceleration, dt);
	}

	calcPosition(dt) {
		let acceleration = this.acceleration
			.clone()
			.multiplyScalar(0.5 * Math.pow(dt, 2));
		let speed = this.velocity.clone().multiplyScalar(dt);
		this.position.add(new Vector3().addVectors(acceleration, speed));
		// console.log(this.position);
	}

	setPosition() {
		console.log("force: " + this.force.toArray());
		console.log("acceleration: " + this.acceleration.toArray());
		console.log("velocity: " + this.velocity.toArray());
		console.log("position: " + this.position.toArray());
		console.log("");

		this.mesh.position.set(
			this.position.x,
			this.position.y,
			this.position.z
		);
	}
}

export class Neutron extends Particle {
	constructor(env, position, velocity) {
		super(env, 0xffa500, 0, position, velocity);
	}
}

export class Proton extends Particle {
	constructor(env, position, velocity) {
		super(env, 0x0000ff, 1, position, velocity);
	}
}

export class Electron extends Particle {
	constructor(env, position, velocity) {
		super(env, 0x00ff00, -1, position, velocity);
	}
}
