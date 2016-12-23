/**
 * Created by rkoch on 12/23/16.
 */

function positionCamera(
    env,
    position = new THREE.Vector3(0,0,0),
    target = new THREE.Vector3(0,0,0),
    up = new THREE.Vector3(0,1,0)
)
{
    env.camera.position.copy(position);
    env.controls.target.copy(target);
    env.camera.up.copy(up);
    env.controls.update();
}

function moveCamera(env){
    console.log("camera move");
    env.controls.target = new THREE.Vector3(10,20,30);
}

function resetCamera(env){
    env.camera.position.copy(env.cameraStart.position);
    env.controls.target.copy(env.cameraStart.target);
    env.camera.up.copy(env.cameraStart.up);
    env.controls.update();
}
