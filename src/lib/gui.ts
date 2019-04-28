import { Vector3 } from 'three';
import { randInteger } from './layout';
import { ParticleType } from './messages';
import Environment from './environment';

interface Options {
  type: ParticleType,
  speedy: boolean
}

export default function placeParticle(env: Environment, options: Options): void {
  const size = env.getBoundarySize();
  const radius = 1;
  const position = new Vector3(randInteger(size-radius), randInteger(size-radius), randInteger(size-radius));
  let velocity = new Vector3();
  if (options.speedy) {
    velocity = new Vector3(randInteger(6), randInteger(6), randInteger(6));
  }

  switch (options.type) {
    case ParticleType.NEUTRON: {
      env.addParticle(position, velocity, 0, 1, 1);
      break;
    }
    case ParticleType.PROTON: {
      env.addParticle(position, velocity, 1, 1, 1);
      break;
    }
    case ParticleType.ELECTRON: {
      env.addParticle(position, velocity, -1, 1, 1);
      break;
    }
    case ParticleType.RANDOM: {
      const chance = Math.random();
      if (chance > 0.66) {
        env.addParticle(position, velocity, 0 ,1, 1);
      } else if (chance > 0.33) {
        env.addParticle(position, velocity, -1, 1, 1);
      } else {
        env.addParticle(position, velocity, 1, 1, 1);
      }
      break;
    }
    default: {
      break;
    }
  }
}
