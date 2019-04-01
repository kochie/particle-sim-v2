import { Vector3, Intersection } from 'three';
import Environment from './environment';

export function positionCamera(
  env: Environment,
  position: Vector3 = new Vector3(0, 0, 0),
  target: Vector3 = new Vector3(0, 0, 0),
  up: Vector3 = new Vector3(0, 1, 0),
): void {
  env.camera.position.copy(position);
  env.controls.target.copy(target);
  env.camera.up.copy(up);
  env.controls.update();
}

export function resetCamera(env: Environment): void {
  env.deselectObject();
  env.camera.position.copy(env.cameraStart.position);
  env.controls.target.copy(env.cameraStart.target);
  env.camera.up.copy(env.cameraStart.up);
  env.controls.update();
}

export function getIntersects(env: Environment): Intersection[] {
  env.raycaster.setFromCamera(env.mouse, env.camera);

  return env.raycaster.intersectObjects(env.particleGroup.meshList);
}

export function objectClick(env: Environment): boolean {
  const intersects = getIntersects(env);

  if (intersects.length > 0) {
    for (let j = 0; j < env.particleGroup.particles.length; j += 1) {
      env.particleGroup.particles[j].setDefaultColour();
    }

    intersects[0].object.material.color.set(0xff0000);
    env.cameraFocus(intersects[0].object, env);
    return true;
  }
  return false;
}
