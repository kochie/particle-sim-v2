/**
 * Created by rkoch on 1/1/17.
 */

import { Vector3 } from 'three';
import { Proton, Electron } from './particle.js';

const placeParticle = function (env) {
  const x = new Vector3(randInteger(5), randInteger(5), randInteger(5));
  console.log(randInteger(1));
  if (randInteger(1) > 0) {
    new Proton(env, x);
  } else {
    new Electron(env, x);
  }
};

export { placeParticle };
