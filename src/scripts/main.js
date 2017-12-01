/**
 * Created by Robert Koch on 12/15/16.
 * https://threejs.org/docs/scenes/geometry-browser.html#TorusKnotBufferGeometry
 */

import { init } from "./components/init.js";

function render(env) {
	window.requestAnimationFrame(() => {
		render(env);
	});
	//console.log(env.camera.getWorldDirection());
	// TWEEN.update();

	env.stats.begin();
	env.controls.update();
	env.renderer.render(env.scene, env.camera);
	env.stats.end();
}

function animate(env) {
	env.particleGroup.calculateForceAll(env);
	env.particleGroup.updatePositionAll();
}

render(init());
