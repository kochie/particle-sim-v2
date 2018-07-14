import React from 'react';
import init from '../lib/init';

export default class Canvas extends React.Component {
  componentDidMount() {
    this.renderCanvas(init(this.canvasElement));
  }

  renderCanvas(env) {
    window.requestAnimationFrame(() => {
      this.renderCanvas(env);
    });
    // console.log(env.camera.getWorldDirection());
    // TWEEN.update();

    env.stats.begin();
    env.controls.update();
    env.renderer.render(env.scene, env.camera);
    env.stats.end();
  }

  render() {
    return (
      <div ref={(element) => { this.canvasElement = element; }} />
    );
  }
}
