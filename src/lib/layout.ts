import { Vector3 } from 'three';

import { Electron, Proton } from './particle';
import Environment from './environment';

export const randInteger = (x: number): number => Math.round(Math.random() * (2 * x) - x);

// export const randomParticles = (env: Environment, t: number): void => {
//   for (let i = 0; i < t; i += 1) {
//     if (randInteger(t) > 0) {
//       env.addParticle(new Vector3(randInteger(t), randInteger(t), randInteger(t)),
//       ));
//     } else {
//       env.addParticle(new Vector3(randInteger(t), randInteger(t), randInteger(t)),
//       ));
//     }
//   }
// };
