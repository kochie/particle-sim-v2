import {
  Vector3
} from 'three';
import { KinematicMethod } from './messages';
import { World } from './world';


export class Particle {
  public mass: number
  public radius: number
  public charge: number
  public position: Vector3
  public velocity: Vector3
  public acceleration: Vector3
  public force: Vector3
  public uuid: string

  public constructor(
    uuid: string,
    charge = 0,
    position = new Vector3(),
    velocity = new Vector3(),
    radius = 1,
    mass = 1
  ) {
    this.uuid = uuid
    this.mass = mass;
    this.charge = charge;
    this.position = position;
    this.velocity = velocity;
    this.acceleration = new Vector3();
    this.force = new Vector3();
    this.radius = radius
  }


  public updateVelocity(velocity: Vector3): void {
    this.velocity = velocity;
  }


  public calcForce(world: World): Vector3 {
    const E = world.getElectricField(this.position);
    const B = world.getMagneticField(this.position);
    const G = world.getGravityField(this.position)
    const q = this.charge;
    const m = this.mass;
    const v = this.velocity.clone();
    const value = new Vector3()
      .addVectors(E, new Vector3().crossVectors(v, B))
      .multiplyScalar(q)
      .add(G.multiplyScalar(m));
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


}

// export class Neutron extends Particle {
//   public constructor(position: Vector3, velocity: Vector3 = new Vector3(), radius = 1, mass = 1) {
//     super(0, position, velocity, radius, mass);
//   }
// }

// export class Proton extends Particle {
//   public constructor(position: Vector3, velocity: Vector3 = new Vector3(), radius = 1, mass = 1) {
//     super(1, position, velocity, radius, mass);
//   }
// }

// export class Electron extends Particle {
//   public constructor(position: Vector3, velocity: Vector3 = new Vector3(), radius = 1, mass = 1) {
//     super(-1, position, velocity, radius, mass);
//   }
// }
