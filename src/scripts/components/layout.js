/**
 * Created by rkoch on 12/28/16.
 */

import { Vector3 } from 'three';
import { Electron, Proton } from './particle.js';

export const randomParticles = (env, t) => {
  for (let i = 0; i < t; i++) {
    if (randInteger(t) > 0) {
      new Electron(
        env,
        new Vector3(randInteger(t), randInteger(t), randInteger(t)),
      );
    } else {
      new Proton(
        env,
        new Vector3(randInteger(t), randInteger(t), randInteger(t)),
      );
    }
  }
};

const randInteger = x => Math.round(Math.random() * (2 * x) - x);
