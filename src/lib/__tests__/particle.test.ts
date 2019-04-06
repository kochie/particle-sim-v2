import { Vector3 } from 'three';

import {
  Particle, ParticleGroup, Electron,
} from '../particle';
import Environment, { Options } from '../environment';

describe('Paticle object', () => {
  it('should create a particle', () => {
    const p = new Particle();
    expect(p).toBeDefined();
  });
});

const env = jest.fn<Environment, [Options]>()
const init = (): ParticleGroup => new ParticleGroup(env);
const zero = new Vector3(0, 0, 0);

describe('Particle group', () => {
  it('should make a particle group', () => {
    const pg = new ParticleGroup(env);
    expect(pg).toBeDefined();
  });

  it('should calculate correct center of mass', () => {
    let pg = init();
    pg.addParticle(new Electron(new Vector3(1, 2, 3)));
    expect(pg.centerOfMass).toEqual(new Vector3());
    pg.calcCenterOfMass();
    expect(pg.centerOfMass).toEqual(new Vector3(1, 2, 3));

    pg.addParticle(new Electron(new Vector3(-1, -2, -3)));
    pg.calcCenterOfMass();
    expect(pg.centerOfMass).toEqual(new Vector3(0, 0, 0));

    pg = new ParticleGroup(env);
    pg.addParticle(new Electron(new Vector3(1, 0, 0)));
    pg.addParticle(new Electron(new Vector3(0, 1, 0)));
    pg.addParticle(new Electron(new Vector3(0, 0, 1)));
    pg.calcCenterOfMass();
    expect(pg.centerOfMass).toEqual(new Vector3(1 / 3, 1 / 3, 1 / 3));
  });

  it('should calculate correct group velocity', () => {
    const pg = init();
    pg.addParticle(new Electron(zero, new Vector3(1, 1, 1)));
    pg.calcGroupVelocity();
    expect(pg.groupVelocity).toEqual(new Vector3(1, 1, 1));

    pg.addParticle(new Electron(zero, new Vector3(-1, -1, -1)));
    pg.calcGroupVelocity();
    expect(pg.groupVelocity).toEqual(zero);

    pg.addParticle(new Electron(zero, new Vector3(5, 5, 5)));
    pg.addParticle(new Electron(zero, new Vector3(-3, -2, -1)));
    pg.calcGroupVelocity();
    expect(pg.groupVelocity).toEqual(new Vector3(2, 3, 4));
  });

  it('should calculate correct group acceleration', () => {
    const pg = init();
    const e = new Electron();
    e.acceleration = new Vector3(1, 1, 1);
    pg.addParticle(e);
    pg.calcGroupAcceleration();
    expect(pg.groupAcceleration).toEqual(new Vector3(1, 1, 1));

    const e1 = new Electron();
    e1.acceleration = new Vector3(-1, -1, -1);
    pg.addParticle(e1);
    pg.calcGroupAcceleration();
    expect(pg.groupAcceleration).toEqual(zero);

    const e2 = new Electron();
    e2.acceleration = new Vector3(5, 5, 5);
    const e3 = new Electron();
    e3.acceleration = new Vector3(-3, -2, -1);
    pg.addParticle(e2);
    pg.addParticle(e3);
    pg.calcGroupAcceleration();
    expect(pg.groupAcceleration).toEqual(new Vector3(2, 3, 4));
  });
});
