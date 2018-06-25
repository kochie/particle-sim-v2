/**
 * Created by Robert Koch on 12/15/16.
 * https://threejs.org/docs/scenes/geometry-browser.html#TorusKnotBufferGeometry
 */

import init from './components/init';

function render(env) {
  window.requestAnimationFrame(() => {
    render(env);
  });
  // console.log(env.camera.getWorldDirection());
  // TWEEN.update();

  env.stats.begin();
  env.controls.update();
  env.renderer.render(env.scene, env.camera);
  env.stats.end();
}

render(init());
