/**
 * Created by rkoch on 1/1/17.
 */

import { Vector3 } from 'three';
import { Proton, Electron, Neutron } from './particle';
import { randInteger } from './layout';

export default function placeParticle(env, { type = 'random', speedy = false } = {}) {
  const { size } = env.particleGroup.boundary;
  const x = new Vector3(randInteger(size), randInteger(size), randInteger(size));
  // console.log(randInteger(1));
  let s = new Vector3();
  if (speedy) {
    s = new Vector3(randInteger(6), randInteger(6), randInteger(6));
  }

  switch (type) {
    case 'neutron': {
      env.addParticle(new Neutron(x, s));
      break;
    }
    case 'proton': {
      env.addParticle(new Proton(x, s));
      break;
    }
    case 'electron': {
      env.addParticle(new Electron(x, s));
      break;
    }
    case 'random': {
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
