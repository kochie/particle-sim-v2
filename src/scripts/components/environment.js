import { Raycaster, Vector2, Vector3 } from 'three';
import { ParticleGroup } from './particle';
import { RingGroup } from './torus';
import Field from './fields';

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
      // (x, y, z) => Math.sin(x) * y + z,
      // (x, y) => Math.sin(x) * y,
      // () => 0,
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

  addParticle(particle) {
    this.scene.add(particle.mesh);
    this.particleGroup.addParticle(particle);
  }

  onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

    this.mouse.x = event.clientX / window.innerWidth * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  cameraFocus(particle, env) {
    const part = particle.particle;
    this.deselectObject();
    part.mesh.add(env.camera);
    this.activeParticle = part;
  }

  deselectObject() {
    if (this.activeParticle) {
    // console.log(env.activeParticle);
      this.activeParticle.mesh.remove(this.camera);
      this.activeParticle.setDefaultColour();
      this.activeParticle = undefined;
    }
  }

  moveCamera() {
  // console.log('camera move');
    this.controls.target = new Vector3(10, 20, 30);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
