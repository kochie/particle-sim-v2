/**
 * Created by rkoch on 1/1/17.
 */

import { Vector3 } from 'three';
import { Proton, Electron } from './particle';
import { randInteger } from './layout';

export default function placeParticle(env) {
  const x = new Vector3(randInteger(5), randInteger(5), randInteger(5));
  // console.log(randInteger(1));
  if (randInteger(1) > 0) {
    env.addParticle(new Proton(x));
  } else {
    env.addPArticle(new Electron(env, x));
  }
}
