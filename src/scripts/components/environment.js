import { Raycaster, Vector2 } from 'three';
import { ParticleGroup } from './particle';
import { RingGroup } from './torus';
import { Field } from './fields';

export default class Environment {
  constructor(options) {
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
    this.scene = options.scene;
    this.camera = options.camera;
    this.renderer = options.renderer;
    this.stats = options.stats;
    this.stepTime = 100;
    this.cameraStart = {};
    this.particleGroup = new ParticleGroup(this);
    this.ringGroup = new RingGroup(this);

    this.renderer.setPixelRatio(
      window.devicePixelRatio ? window.devicePixelRatio : 1,
    );
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);
    document.body.appendChild(this.renderer.domElement);

    this.magneticField = new Field(
      (x, y, z) => Math.sin(x) * y + z,
      (x, y) => Math.sin(x) * y,
      () => 0,
    );

    this.electricField = new Field();
  }

  setAnimation(animation) {
    const that = this;
    if (typeof this.intervalId !== 'undefined') {
      clearInterval(this.intervalId);
    }
    if (this.stepTime !== 100) {
      this.intervalId = setInterval(() => {
        animation(that);
      }, this.stepTime);
    }
  }
}
