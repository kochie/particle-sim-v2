/**
 * Created by rkoch on 12/23/16.
 */

import { Vector3 } from 'three';

const positionCamera = function (
  env,
  position = new Vector3(0, 0, 0),
  target = new Vector3(0, 0, 0),
  up = new Vector3(0, 1, 0),
) {
  env.camera.position.copy(position);
  env.controls.target.copy(target);
  env.camera.up.copy(up);
  env.controls.update();
};

const moveCamera = function (env) {
  console.log('camera move');
  env.controls.target = new Vector3(10, 20, 30);
};

const resetCamera = function (env) {
  deselectObject(env);
  env.camera.position.copy(env.cameraStart.position);
  env.controls.target.copy(env.cameraStart.target);
  env.camera.up.copy(env.cameraStart.up);
  env.controls.update();
};

const deselectObject = function (env) {
  if (env.activeParticle) {
    // console.log(env.activeParticle);
    env.activeParticle.mesh.remove(env.camera);
    env.activeParticle.setDefaultColour();
    env.activeParticle = undefined;
  }
};

const objectDrag = function (env) {
  const intersects = getIntersects(env);

  if (intersects.length > 0) {
    intersects[0].object.material.color.set(0xfff000);
    document.addEventListener('mouseup', function () {
      // /this will execute only once
      alert('only once!');
      intersects[0].object.particle.setDefaultColour();
      this.removeEventListener('mouseup', arguments.callee);
    });
    return true;
  }
  return false;
};

const getIntersects = function (env) {
  env.raycaster.setFromCamera(env.mouse, env.camera);

  // calculate objects intersecting the picking ray
  return env.raycaster.intersectObjects(env.particleGroup.meshList);
};

const objectClick = function (env) {
  // console.log(env.particleGroup.meshList);
  const intersects = getIntersects(env);

  if (intersects.length > 0) {
    // console.log('ayy');
    for (let j = 0; j < env.particleGroup.particles.length; j++) {
      env.particleGroup.particles[j].setDefaultColour();
    }

    intersects[0].object.material.color.set(0xff0000);
    cameraFocus(intersects[0].object, env);
    return true;
  }
  return false;
};

const cameraFocus = function (particle, env) {
  particle = particle.particle;
  deselectObject(env);
  particle.mesh.add(env.camera);
  env.activeParticle = particle;
};

const onMouseMove = function (event, env) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  env.mouse.x = event.clientX / window.innerWidth * 2 - 1;
  env.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
};

export {
  positionCamera,
  moveCamera,
  resetCamera,
  deselectObject,
  objectDrag,
  getIntersects,
  objectClick,
  cameraFocus,
  onMouseMove,
};
