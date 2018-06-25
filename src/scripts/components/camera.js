/**
 * Created by rkoch on 12/23/16.
 */

import { Vector3 } from 'three';

export function positionCamera(
  env,
  position = new Vector3(0, 0, 0),
  target = new Vector3(0, 0, 0),
  up = new Vector3(0, 1, 0),
) {
  env.camera.position.copy(position);
  env.controls.target.copy(target);
  env.camera.up.copy(up);
  env.controls.update();
}

export function resetCamera(env) {
  env.deselectObject(env);
  env.camera.position.copy(env.cameraStart.position);
  env.controls.target.copy(env.cameraStart.target);
  env.camera.up.copy(env.cameraStart.up);
  env.controls.update();
}


// export function objectDrag(env) {
//   const intersects = getIntersects(env);

//   if (intersects.length > 0) {
//     intersects[0].object.material.color.set(0xfff000);
//     document.addEventListener('mouseup', () => {
//       // /this will execute only once
//       // alert('only once!');
//       intersects[0].object.particle.setDefaultColour();
//       this.removeEventListener('mouseup', arguments.callee);
//     });
//     return true;
//   }
//   return false;
// }

export function getIntersects(env) {
  env.raycaster.setFromCamera(env.mouse, env.camera);

  // calculate objects intersecting the picking ray
  return env.raycaster.intersectObjects(env.particleGroup.meshList);
}

export function objectClick(env) {
  // console.log(env.particleGroup.meshList);
  const intersects = getIntersects(env);

  if (intersects.length > 0) {
    // console.log('ayy');
    for (let j = 0; j < env.particleGroup.particles.length; j += 1) {
      env.particleGroup.particles[j].setDefaultColour();
    }

    intersects[0].object.material.color.set(0xff0000);
    env.cameraFocus(intersects[0].object, env);
    return true;
  }
  return false;
}
