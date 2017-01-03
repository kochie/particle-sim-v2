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
    deselectObject(env);
    env.camera.position.copy(env.cameraStart.position);
    env.controls.target.copy(env.cameraStart.target);
    env.camera.up.copy(env.cameraStart.up);
    env.controls.update();
}

function deselectObject(env){
    if (env.activeParticle){
        // console.log(env.activeParticle);
        env.activeParticle.mesh.remove(env.camera);
        env.activeParticle.setDefaultColour();
        env.activeParticle = undefined;
    }
}

function objectDrag(env){
    const intersects = getIntersects(env);

    if (intersects.length > 0){
        intersects[0].object.material.color.set( 0xfff000 );
        document.addEventListener('mouseup', function() {
            ///this will execute only once
            alert('only once!');
            intersects[0].object.particle.setDefaultColour();
            this.removeEventListener('mouseup', arguments.callee);
        });
        return true;
    } else {
        return false;
    }
}

function getIntersects(env) {
    env.raycaster.setFromCamera(env.mouse, env.camera);

    // calculate objects intersecting the picking ray
    return env.raycaster.intersectObjects(env.particleGroup.meshList);
}

function objectClick(env){
    // console.log(env.particleGroup.meshList);
    const intersects = getIntersects(env);

    if (intersects.length > 0){
        // console.log('ayy');
        for (let j = 0; j < env.particleGroup.particles.length; j++){
            env.particleGroup.particles[j].setDefaultColour();
        }

        intersects[0].object.material.color.set( 0xff0000 );
        cameraFocus(intersects[0].object, env);
        return true;
    } else {
        return false;
    }
}

function cameraFocus(particle, env){
    particle = particle.particle;
    deselectObject(env);
    particle.mesh.add(env.camera);
    env.activeParticle = particle;

}

function onMouseMove(event, env){
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    env.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    env.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

