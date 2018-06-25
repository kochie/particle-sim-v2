/**
 * Created by rkoch on 12/23/16.
 */

export const onWindowResize = (env) => {
  env.camera.aspect = window.innerWidth / window.innerHeight;
  env.camera.updateProjectionMatrix();
  env.renderer.setSize(window.innerWidth, window.innerHeight);
};
