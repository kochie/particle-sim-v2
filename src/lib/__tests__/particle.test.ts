import { Vector3 } from 'three';
import {v4 as uuidv4} from "uuid"
import {
  Particle
} from '../particle';
import { KinematicMethod } from '../messages';

describe('Paticle object', (): void => {
  it('should create a particle', (): void => {
    const p = new Particle(uuidv4());
    expect(p).toBeDefined();
  });

  it("should update the velocity", (): void => {
    const p = new Particle(uuidv4())

    expect(p.velocity).toEqual(new Vector3())
    const newVel = new Vector3(1,1,1)
    p.updateVelocity(newVel)

    expect(p.velocity).toEqual(newVel)
  })

  // TODO: more test conditions, change v, q, and p
  it("should calculate the force on the particle", (): void => {
    const p = new Particle(uuidv4())
    
    const E = new Vector3(1,2,3)
    const B = new Vector3(1,2,3)
    const G = new Vector3(1,2,3)
    
    const force = p.calcForce(E,B,G)

    expect(force).toEqual(new Vector3(1,2,3))
  })

  it("should calculate acceleration based on force and mass", (): void => {
    const p = new Particle(uuidv4())

    p.force = new Vector3(1,2,3)
    p.calcAcceleration()
    expect(p.acceleration).toEqual(new Vector3(1,2,3))
  })

  it("should calculate acceleration based on force and mass", (): void => {
    const p = new Particle(uuidv4())
    p.mass = 0
    p.force = new Vector3(1,2,3)
    p.calcAcceleration()

    expect(p.acceleration).toEqual(new Vector3(Infinity, Infinity, Infinity))
  })

  it("should calculate the position and velocity", (): void => {
    const p = new Particle(uuidv4())
    const dt = 0.01
    p.acceleration = new Vector3(2,2,2)
    p.calcKinematics(dt, KinematicMethod.EULER)

    expect(p.position).toEqual(new Vector3(
      0.00030000000000000003,
      0.00030000000000000003,
      0.00030000000000000003
    ))
    expect(p.velocity).toEqual(new Vector3(
      0.02,
      0.02,
      0.02
    ))
  })

  it("should calculate the position and velocity", (): void => {
    const p = new Particle(uuidv4())
    const dt = 0.01
    p.acceleration = new Vector3(2,2,2)
    p.calcKinematics(dt, KinematicMethod.RK4)

    expect(p.position).toEqual(new Vector3())
    expect(p.velocity).toEqual(new Vector3())
  })

  it("should calculate the position and velocity", (): void => {
    const p = new Particle(uuidv4())
    const dt = 0.01
    p.acceleration = new Vector3(2,2,2)
    p.calcKinematics(dt, null)

    expect(p.position).toEqual(new Vector3())
    expect(p.velocity).toEqual(new Vector3())
  })
});