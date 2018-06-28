/**
 * Created by rkoch on 1/1/17.
 */

import { Vector3 } from 'three';
import { Proton, Electron, Neutron } from './particle';
import { randInteger } from './layout';

export default function placeParticle(env, type = 'random') {
  const x = new Vector3(randInteger(20), randInteger(20), randInteger(20));
  // console.log(randInteger(1));

  switch (type) {
    case 'neutron': {
      env.addParticle(new Neutron(x));
      break;
    }
    case 'proton': {
      env.addParticle(new Proton(x));
      break;
    }
    case 'electron': {
      env.addParticle(new Electron(x));
      break;
    }
    case 'random': {
      const chance = Math.random();
      if (chance > 0.66) {
        env.addParticle(new Neutron(x));
      } else if (chance > 0.33) {
        env.addParticle(new Electron(x));
      } else {
        env.addParticle(new Proton(x));
      }
      break;
    }
    default: {
      break;
    }
  }
}
