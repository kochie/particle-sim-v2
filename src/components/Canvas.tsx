import * as React from 'react';

import init from '../lib/init';
import Environment from '../lib/environment';

export default class Canvas extends React.Component {
  public canvasElement: HTMLCanvasElement

  public componentDidMount(): void {
    this.renderCanvas(init(this.canvasElement));
  }

  private renderCanvas(env: Environment): void {
    window.requestAnimationFrame(() => {
      this.renderCanvas(env);
    });

    env.stats.begin();
    env.controls.update();
    env.renderer.render(env.scene, env.camera);
    env.stats.end();
  }

  public render(): React.ReactElement {
    return (
      <canvas ref={(element) => { this.canvasElement = element }} />
    );
  }
}
