/**
 * Created by rkoch on 12/28/16.
 */

import { Vector3 } from 'three';
import { Electron, Proton } from './particle';

export const randInteger = x => Math.round(Math.random() * (2 * x) - x);

export const randomParticles = (env, t) => {
  for (let i = 0; i < t; i += 1) {
    if (randInteger(t) > 0) {
      env.addParticle(new Electron(
        new Vector3(randInteger(t), randInteger(t), randInteger(t)),
      ));
    } else {
      env.addParticle(new Proton(
        new Vector3(randInteger(t), randInteger(t), randInteger(t)),
      ));
    }
  }
};
