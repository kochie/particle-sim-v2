import { Vector3 } from 'three';
import { Proton, Electron, Neutron } from './particle';
import { randInteger } from './layout';
import Environment from './environment';

export enum ParticleType {
  PROTON = "PROTON",
  NEUTRON = "NEUTRON",
  ELECTRON = "ELECTRON",
  RANDOM = "RANDOM"
}

interface Options {
  type: ParticleType,
  speedy: boolean
}

export default function placeParticle(env: Environment, options: Options): void {
  const { size } = env.particleGroup.boundary;
  const radius = 1;
  const x = new Vector3(randInteger(size-radius), randInteger(size-radius), randInteger(size-radius));
  let s = new Vector3();
  if (options.speedy) {
    s = new Vector3(randInteger(6), randInteger(6), randInteger(6));
  }

  switch (options.type) {
    case ParticleType.NEUTRON: {
      env.addParticle(new Neutron(x, s));
      break;
    }
    case ParticleType.PROTON: {
      env.addParticle(new Proton(x, s));
      break;
    }
    case ParticleType.ELECTRON: {
      env.addParticle(new Electron(x, s));
      break;
    }
    case ParticleType.RANDOM: {
      const chance = Math.random();
      if (chance > 0.66) {
        env.addParticle(new Neutron(x, s));
      } else if (chance > 0.33) {
        env.addParticle(new Electron(x, s));
      } else {
        env.addParticle(new Proton(x, s));
      }
      break;
    }
    default: {
      break;
    }
  }
}
