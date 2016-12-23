/**
 * Created by rkoch on 12/23/16.
 */

function onWindowResize(env) {
    env.camera.aspect = window.innerWidth / window.innerHeight;
    env.camera.updateProjectionMatrix();
    env.renderer.setSize( window.innerWidth, window.innerHeight );
}