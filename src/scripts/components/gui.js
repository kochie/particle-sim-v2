/**
 * Created by rkoch on 1/1/17.
 */

import { Vector3 } from 'three';
import { Proton, Electron, Neutron } from './particle';
import { randInteger } from './layout';

export default function placeParticle(env) {
  const x = new Vector3(randInteger(20), randInteger(20), randInteger(20));
  // console.log(randInteger(1));
  if (randInteger(1) > 0) {
    env.addParticle(new Proton(x));
  } else if (randInteger(1) > 0) {
    env.addParticle(new Electron(x));
  } else {
    env.addParticle(new Neutron(x));
  }
}
