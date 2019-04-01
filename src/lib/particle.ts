import {
  Vector3,
  SphereGeometry,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
} from 'three';
import { newId } from './tools';
import Environment from './environment';

const geometry = new SphereGeometry(1, 10, 10);

// Rules for boundary collision.
// A collision with the boundary is detected if the position of the particle is outside the safe zone
// If position.x + radius > boundary.x

enum BoundaryType {
  CLOSED = "CLOSED",
  TORUS = "TORUS",
  DELETE = "DELETE",
  NONE = "NONE"
}

enum KinematicMethod {
  EULER = "EULER",
  RK4 = "RK4"
}

export class ParticleGroup {
  public meshList: Mesh[]
  public particles: Particle[]
  private sumForce: Vector3[]
  private centerOfMass: Vector3
  private groupVelocity: Vector3
  private groupAcceleration: Vector3
  public gravity: number
  public electro: number
  public boundary: {
    type: BoundaryType,
    size: number,
    mesh: Mesh,
    visible: boolean
  }
  private env: Environment

  public constructor(env: Environment) {
    this.meshList = [];
    this.particles = [];
    this.sumForce = [];
    this.centerOfMass = new Vector3();
    this.groupVelocity = new Vector3();
    this.groupAcceleration = new Vector3();
    this.gravity = 1;
    this.electro = 1;
    this.boundary = {
      type: BoundaryType.CLOSED,
      size: 50,
      mesh: null,
      visible: true,
    };
    this.env = env;
    this.drawBoundary();
  }

  public calcGroupVelocity(): void {
    this.groupVelocity = new Vector3();
    this.particles.forEach((particle) => {
      this.groupVelocity.add(particle.velocity);
    });
  }

  public calcGroupAcceleration(): void {
    this.groupAcceleration = new Vector3();
    this.particles.forEach((particle) => {
      this.groupAcceleration.add(particle.acceleration);
    });
  }

  public calcCenterOfMass(): void {
    let totalMass = 0;
    this.centerOfMass = new Vector3();
    this.particles.forEach((particle) => {
      totalMass += particle.mass;
      this.centerOfMass.add(particle.position.multiplyScalar(particle.mass));
    });
    this.centerOfMass.divideScalar(totalMass);
  }

  public toggleBoundaryVisibility(): void {
    this.boundary.visible = !this.boundary.visible;
    this.redrawBoundary();
  }

  public drawBoundary(): void {
    if (this.boundary.type === BoundaryType.NONE || !this.boundary.visible) {
      return;
    }
    const size = this.boundary.size * 2;
    const boundaryGeometry = new BoxGeometry(size, size, size);
    const material = new MeshBasicMaterial({ color: 0x0ffff0, wireframe: true });
    this.boundary.mesh = new Mesh(boundaryGeometry, material);
    this.env.scene.add(this.boundary.mesh);
  }

  public changeBoundaryType(type: BoundaryType): void {
    this.boundary.type = type;
    this.redrawBoundary();
  }

  public changeBoundarySize(size: number): void {
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

  public redrawBoundary(): void {
    this.env.scene.remove(this.boundary.mesh);
    this.drawBoundary();
  }

  public index(i: number, j: number): number {
    return (i - 1) * this.particles.length + (j - 1) - i * (i + 1) / 2;
  }

  public addParticle(particle: Particle): void {
    this.particles.push(particle);
    this.meshList.push(particle.mesh);
    if (this.particles.length > 1) {
      this.sumForce.push(new Vector3());
    }
  }

  public removeParticle(particle: Particle): void {
    const index = this.particles.indexOf(particle);
    this.particles.splice(index, 1);
    this.meshList.splice(index, 1);
    this.sumForce.pop();
  }

  public getForceValue(i: number, j: number): Vector3 {
    if (i < j) {
      return this.sumForce[this.index(i, j)];
    } if (i > j) {
      return this.sumForce[this.index(j, i)].clone().multiplyScalar(-1);
    }
    return new Vector3();
  }

  public updateForce(i: number, j: number): void {
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

  public calculateForceOn(i: number, env: Environment): Vector3 {
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

  public calculateForceAll(env: Environment): void {
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

  public updatePositionAll(): void {
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

  public calculateCollision(particle1: Particle, particle2: Particle): void {
    const radius2 = 2
    if (particle1.position.distanceTo(particle2.position) < radius2) {
      const particleVel = particle1.velocity.clone().sub(particle2.velocity)
      const particleDist = particle1.position.clone().sub(particle2.position)

      const g1 = particleVel.clone().dot(particleDist)/(particleDist.lengthSq())*(2*particle2.mass/(particle1.mass+particle2.mass))
      const newVelocity1 = new Vector3().subVectors(particle1.velocity, particleVel.clone().multiplyScalar(g1))
      const g2 = particleVel.clone().negate().dot(particleDist.clone().negate())/(particleDist.lengthSq())*(2*particle1.mass/(particle1.mass+particle2.mass))
      const newVelocity2 = new Vector3().addVectors(particle2.velocity, particleVel.clone().negate().multiplyScalar(g2))

      particle1.velocity.copy(newVelocity1)
      particle2.velocity.copy(newVelocity2)
    }
  }
}

export class Particle {
  public mass: number
  public charge: number
  public defaultColour: number
  public colour: number
  public position: Vector3
  public velocity: Vector3
  public acceleration: Vector3
  public force: Vector3
  public mesh: Mesh
  public id: number

  public constructor(
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
    this.mesh = new Mesh();
    this.buildObject();
    this.id = newId();
    this.mesh.material.color.setHex(this.colour);
  }

  public setDefaultColour(): void {
    this.mesh.material.color.set(this.defaultColour);
  }

  public updateVelocity(velocity: Vector3): void {
    this.velocity = velocity;
  }

  public buildObject(): void {
    this.mesh = new Mesh(
      geometry,
      new MeshBasicMaterial({ color: this.colour, wireframe: true }),
    );
    this.mesh.particle = this;
    this.setPosition();
  }

  public calcForce(env: Environment): Vector3 {
    const E = env.electricField.getValue(this.position);
    const B = env.magneticField.getValue(this.position);
    const q = this.charge;
    const v = this.velocity.clone();
    const value = new Vector3()
      .addVectors(E, new Vector3().crossVectors(v, B))
      .multiplyScalar(q);
    return value;
  }

  public calcAcceleration(): void {
    this.acceleration.copy(this.force.clone().divideScalar(this.mass));
  }

  public calcKinematics(dt: number, method: KinematicMethod = KinematicMethod.EULER): void {
    switch (method) {
      case KinematicMethod.EULER: {
        this.velocity.addScaledVector(this.acceleration, dt);
        const a = this.acceleration.clone().multiplyScalar(0.5 * (dt ** 2));
        const s = this.velocity.clone().multiplyScalar(dt);
        this.position.add(a).add(s);
        break;
      }
      case KinematicMethod.RK4: {
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

  public boundaryBox(size: number, type: BoundaryType = BoundaryType.TORUS, env: Environment): void {
    const decay = 0.98
    const radius = 1
    switch (type) {
      case BoundaryType.CLOSED: {
        if (this.position.x + radius > size) {
          debugger;
          this.velocity.x = -this.velocity.x*decay
          this.position.x -= this.position.x + radius - size
        }
        if (this.position.x - radius < -size) {
          this.velocity.x = -this.velocity.x*decay
          this.position.x += radius + size
        }
        if (this.position.y + radius > size) {
          this.velocity.y = -this.velocity.y*decay
          this.position.y += this.position.y + radius - size
        }
        if (this.position.y - radius < -size) {
          this.velocity.y = -this.velocity.y*decay
          this.position.y += this.position.y - radius + size
        }
        if (this.position.z + radius > size) {
          this.velocity.z = -this.velocity.z*decay
          this.position.z += this.position.z + radius - size
        }
        if (this.position.z - radius < -size) {
          this.velocity.z = -this.velocity.z*decay
          this.position.z += this.position.z - radius + size
        }
        break;
      }
      case BoundaryType.TORUS: {
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
      case BoundaryType.DELETE: {
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

  public setPosition(): void {
    this.mesh.position.set(
      this.position.x,
      this.position.y,
      this.position.z,
    )
  }
}

export class Neutron extends Particle {
  public constructor(position: Vector3, velocity: Vector3) {
    super(0xffa500, 0, position, velocity);
  }
}

export class Proton extends Particle {
  public constructor(position: Vector3, velocity: Vector3 = new Vector3()) {
    super(0x0000ff, 1, position, velocity);
  }
}

export class Electron extends Particle {
  public constructor(position: Vector3, velocity: Vector3 = new Vector3()) {
    super(0x00ff00, -1, position, velocity);
  }
}
