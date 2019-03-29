/**
 * Created by rkoch on 12/23/16.
 */

import {
  Vector3,
  Object3D,
  SphereGeometry,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
} from 'three';
import { newId } from './tools';

const geometry = new SphereGeometry(1, 10, 10);

// Rules for boundary collision.
// A collision with the boundary is detected if the position of the particle is outside the safe zone
// If position.x + radius > boundary.x

export class ParticleGroup {
  constructor(env) {
    this.meshList = [];
    this.particles = [];
    this.sumForce = [];
    this.centerOfMass = new Vector3();
    this.groupVelocity = new Vector3();
    this.groupAcceleration = new Vector3();
    this.gravity = true;
    this.electro = true;
    this.boundary = {
      type: 'closed',
      size: 50,
      mesh: null,
      visible: true,
    };
    this.env = env;
    this.drawBoundary();
  }

  calcGroupVelocity() {
    this.groupVelocity = new Vector3();
    this.particles.forEach((particle) => {
      this.groupVelocity.add(particle.velocity);
    });
  }

  calcGroupAcceleration() {
    this.groupAcceleration = new Vector3();
    this.particles.forEach((particle) => {
      this.groupAcceleration.add(particle.acceleration);
    });
  }

  calcCenterOfMass() {
    let totalMass = 0;
    this.centerOfMass = new Vector3();
    this.particles.forEach((particle) => {
      totalMass += particle.mass;
      this.centerOfMass.add(particle.position.multiplyScalar(particle.mass));
    });
    this.centerOfMass.divideScalar(totalMass);
  }

  toggleBoundaryVisibility() {
    this.boundary.visible = !this.boundary.visible;
    this.redrawBoundary();
  }

  drawBoundary() {
    if (this.boundary.type === 'none' || !this.boundary.visible) {
      return;
    }
    const size = this.boundary.size * 2;
    const boundaryGeometry = new BoxGeometry(size, size, size);
    const material = new MeshBasicMaterial({ color: 0x0ffff0, wireframe: true });
    this.boundary.mesh = new Mesh(boundaryGeometry, material);
    this.env.scene.add(this.boundary.mesh);
  }

  changeBoundaryType(type) {
    this.boundary.type = type;
    this.redrawBoundary();
  }

  changeBoundarySize(size) {
    this.boundary.size = size;
    this.particles.forEach(particle => {
        if (particle.position.x > size) {
          particle.position.x = (particle.position.x % size) - size;
        }
        if (particle.position.x < -size) {
          particle.position.x = (particle.position.x % size) + size;
        }
        if (particle.position.y > size) {
          particle.position.y = (particle.position.y % size) - size;
        }
        if (particle.position.y < -size) {
          particle.position.y = (particle.position.y % size) + size;
        }
        if (particle.position.z > size) {
          particle.position.z = (particle.position.z % size) - size;
        }
        if (particle.position.z < -size) {
          particle.position.z = (particle.position.z % size) + size;
        }
    })
    this.redrawBoundary();
  }

  redrawBoundary() {
    this.env.scene.remove(this.boundary.mesh);
    this.drawBoundary();
  }

  index(i, j) {
    return (i - 1) * this.particles.length + (j - 1) - i * (i + 1) / 2;
  }

  addParticle(particle) {
    this.particles.push(particle);
    this.meshList.push(particle.mesh);
    if (this.particles.length > 1) {
      this.sumForce.push(0);
    }
    // console.log(`sumForce Length: ${this.sumForce.length}`);
  }

  removeParticle(particle) {
    const index = this.particles.indexOf(particle);
    this.particles.splice(index, 1);
    this.meshList.splice(index, 1);
    this.sumForce.pop();
  }

  getForceValue(i, j) {
    if (i < j) {
      // console.log(((j-3)+(i)));
      return this.sumForce[this.index(i, j)];
    } if (i > j) {
      return this.sumForce[this.index(j, i)].clone().multiplyScalar(-1);
    }
    return new Vector3();
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

    const p1 = this.particles[i - 1].position.clone();
    const p2 = this.particles[j - 1].position.clone();

    const m1 = this.particles[i - 1].mass;
    const m2 = this.particles[j - 1].mass;

    const q1 = this.particles[i - 1].charge;
    const q2 = this.particles[j - 1].charge;

    const G = this.gravity;
    const K = this.electro;
    // console.log(this.gravity, G, this.electro, K);

    const r2 = p1.distanceToSquared(p2);
    // console.log(`force for index ${this.index(i,j)} is [${value.x}, ${value.y}, ${value.z}]`);
    this.sumForce[this.index(i, j)] = p1
      .sub(p2)
      .normalize()
      .multiplyScalar(((q1 * q2 * K) - (m1 * m2 * G)) / r2);
  }

  calculateForceOn(i, env) {
    const value = new Vector3();
    for (let x = 1; x <= this.particles.length; x += 1) {
      // console.log(i,x);
      value.add(this.getForceValue(i, x));
    }
    // console.log(this.particles[i-1]);
    const fieldForce = this.particles[i - 1].calcForce(env);
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

         [(1,2) (1,3) (2,3)]gravity
         */

    for (let i = 1; i < this.particles.length; i += 1) {
      for (let j = i + 1; j <= this.particles.length; j += 1) {
        this.updateForce(i, j);
      }
    }

    for (let i = 0; i < this.particles.length; i += 1) {
      this.particles[i].force = this.calculateForceOn(i + 1, env);
    }

    // console.log(this.sumForce);
  }

  updatePositionAll() {
    this.particles.forEach(particle => particle.calcAcceleration())
    this.particles.forEach(particle => particle.calcKinematics(0.1))
    this.particles.forEach(particle => particle.boundaryBox(
        this.boundary.size,
        this.boundary.type,
        this.env,
      )
    )
    for (let i = 0; i < this.particles.length-1; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        this.calculateCollision(this.particles[i], this .particles[j])
      }
    }

    this.particles.forEach(particle => particle.setPosition());
  }

  calculateCollision(particle1, particle2) {
    const radius2 = 2
    if (particle1.position.distanceTo(particle2.position) < radius2) {
      const particleVel = particle1.velocity.clone().sub(particle2.velocity)
      const particleDist = particle1.position.clone().sub(particle2.position)

      const g1 = particleVel.clone().dot(particleDist).divideScalar(particleDist.lengthSq()).multiplyScalar(2*particle2.mass/(particle1.mass+particle2.mass))
      const newVelocity1 = new Vector3().subVectors(particle1.velocity, particleVel.clone().multiplyScalar(g1))
      const g2 = particleVel.clone().neg().dot(particleDist.clone().neg()).divideScalar(particleDist.lenghtSq()).multiplyScalar(2*particle1.mass/(particle1.mass+particle2.mass))
      const newVelocity2 = new Vector3().addVectors(particle2.velocity, particleVel.clone().neg().multiplyScalar(g2))

      particle1.velocity.copy(newVelocity1)
      particle2.velocity.copy(newVelocity2)
    }
  }
}

export class Particle {
  constructor(
    colour = 0xffffff,
    charge = 0,
    position = new Vector3(),
    velocity = new Vector3(),
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
    this.id = newId();
    //    env.scene.add(this.mesh);
    //    env.particleGroup.addParticle(this);
    this.mesh.material.color.setHex(this.colour);
  }

  setDefaultColour() {
    this.mesh.material.color.set(this.defaultColour);
  }

  updateVelocity(velocity) {
    this.velocity = velocity;
  }

  buildObject() {
    this.mesh = new Mesh(
      geometry,
      new MeshBasicMaterial({ color: this.colour, wireframe: true }),
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
    const E = env.electricField.getValue(this.position);
    const B = env.magneticField.getValue(this.position);
    const q = this.charge;
    const v = this.velocity.clone();
    const value = new Vector3()
      .addVectors(E, new Vector3().crossVectors(v, B))
      .multiplyScalar(q);
    // console.log(value);
    return value;
  }

  calcAcceleration() {
    // a = F/m
    this.acceleration.copy(this.force.clone().divideScalar(this.mass));
  }

  calcKinematics(dt, method = 'euler') {
    switch (method) {
      case 'euler': {
        this.velocity.addScaledVector(this.acceleration, dt);
        const a = this.acceleration.clone().multiplyScalar(0.5 * (dt ** 2));
        const s = this.velocity.clone().multiplyScalar(dt);
        this.position.add(a).add(s);
        break;
      }
      case 'rk4': {
        // debugger // eslint-disable-line
        const r = this.position;
        const v = this.velocity;
        const a = this.acceleration;

        const kv1 = a.clone().multiply(r);
        const kr1 = v.clone();

        const kv2 = a.clone().multiply(r.clone().add(kr1.clone().multiplyScalar(dt / 2)));
        const kr2 = v.clone().multiply(kv1).multiplyScalar(dt / 2);

        const kv3 = a.clone().multiply(r.clone().add(kr2.clone().multiplyScalar(dt / 2)));
        const kr3 = v.clone().multiply(kv2).multiplyScalar(dt / 2);

        const kv4 = a.clone().multiply(r.clone().add(kr3.clone().multiplyScalar(dt)));
        const kr4 = v.clone().multiply(kv3).multiplyScalar(dt);

        const hv = kv1.add(kv2.multiplyScalar(2)).add(kv3.multiplyScalar(2)).add(kv4);
        const hp = kr1.add(kr2.multiplyScalar(2)).add(kr3.multiplyScalar(2)).add(kr4);

        this.velocity.add(hv.multiplyScalar(dt / 6));
        this.position.add(hp.multiplyScalar(dt / 6));
        break;
      }
      default: {
        break;
      }
    }
  }

  boundaryBox(size, type = 'torus', env) {
    const decay = 0.98
    const radius = 1
    switch (type) {
      case 'closed': {
        if (this.position.x + radius > size) {
          this.velocity.x = -this.velocity.x*decay
        }
        if (this.position.x - radius < -size) {
          this.velocity.x = -this.velocity.x*decay
        }
        if (this.position.y + radius > size) {
          this.velocity.y = -this.velocity.y*decay
        }
        if (this.position.y - radius < -size) {
          this.velocity.y = -this.velocity.y*decay
        }
        if (this.position.z + radius > size) {
          this.velocity.z = -this.velocity.z*decay
        }
        if (this.position.z - radius < -size) {
          this.velocity.z = -this.velocity.z*decay
        }
        break;
      }
      case 'torus': {
        if (this.position.x > size) {
          this.position.x = (this.position.x % size) - size;
        }
        if (this.position.x < -size) {
          this.position.x = (this.position.x % size) + size;
        }
        if (this.position.y > size) {
          this.position.y = (this.position.y % size) - size;
        }
        if (this.position.y < -size) {
          this.position.y = (this.position.y % size) + size;
        }
        if (this.position.z > size) {
          this.position.z = (this.position.z % size) - size;
        }
        if (this.position.z < -size) {
          this.position.z = (this.position.z % size) + size;
        }
        break;
      }
      case 'delete': {
        if (
          this.position.x > size
          || this.position.y > size
          || this.position.z > size
          || this.position.x < -size
          || this.position.y < -size
          || this.position.z < -size
        ) {
          env.removeParticle(this);
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  setPosition() {
    // console.log(`force: ${this.force.toArray()}`);
    // console.log(`acceleration: ${this.acceleration.toArray()}`);
    // console.log(`velocity: ${this.velocity.toArray()}`);
    // console.log(`position: ${this.position.toArray()}`);
    // console.log('');

    this.mesh.position.set(
      this.position.x,
      this.position.y,
      this.position.z,
    );
  }
}

export class Neutron extends Particle {
  constructor(position, velocity) {
    super(0xffa500, 0, position, velocity);
  }
}

export class Proton extends Particle {
  constructor(position, velocity) {
    super(0x0000ff, 1, position, velocity);
  }
}

export class Electron extends Particle {
  constructor(position, velocity) {
    super(0x00ff00, -1, position, velocity);
  }
}
