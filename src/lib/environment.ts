import {
  Raycaster, Vector2, Vector3, Scene, Camera, WebGLRenderer, PerspectiveCamera,
} from 'three';
import { ParticleGroup, Particle } from './particle';
import { RingGroup } from './torus';
import Field from './fields';
import TrackballControls from './TrackballControls';
import { FizzyText } from './init';

interface Options {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
  stats: Stats
}

export default class Environment {
  public raycaster: Raycaster
  public mouse: Vector2
  public scene: Scene
  public camera: PerspectiveCamera
  public renderer: WebGLRenderer
  public stats: Stats
  public stepTime: number
  public cameraStart: {
    position: Vector3
    target: Vector3
    up: Vector3
  }
  public particleGroup: ParticleGroup
  public ringGroup: RingGroup
  public magneticField: Field
  public electricField: Field
  public intervalId: NodeJS.Timeout
  public controls: TrackballControls
  public text: FizzyText
  public gui: dat.GUI
  public activeParticle: Particle
  public speedController: dat.GUIController

  public constructor(options: Options) {
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
    this.scene = options.scene;
    this.camera = options.camera;
    this.renderer = options.renderer;
    this.stats = options.stats;
    this.stepTime = 100;
    this.cameraStart = {
      position: new Vector3(),
      target: new Vector3(),
      up: new Vector3()
    };
    this.particleGroup = new ParticleGroup(this);
    this.ringGroup = new RingGroup();

    this.renderer.setPixelRatio(
      window.devicePixelRatio ? window.devicePixelRatio : 1,
    );
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);

    this.magneticField = new Field();
    this.electricField = new Field();
  }

  public removeParticle(particle: Particle): void {
    this.scene.remove(particle.mesh);
    this.particleGroup.removeParticle(particle);
  }

  public setAnimation(animation: Function): void {
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

  public addParticle(particle: Particle): void {
    this.scene.add(particle.mesh);
    this.particleGroup.addParticle(particle);
  }

  public onMouseMove(event: MouseEvent): void {
    this.mouse.x = event.clientX / window.innerWidth * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  public cameraFocus(particle: Particle): void {
    this.deselectObject();
    particle.mesh.add(this.camera);
    this.activeParticle = particle;
  }

  public deselectObject(): void {
    if (this.activeParticle) {
      this.activeParticle.mesh.remove(this.camera);
      this.activeParticle.setDefaultColour();
      this.activeParticle = undefined;
    }
  }

  public moveCamera(): void {
    this.controls.target = new Vector3(10, 20, 30);
  }

  public onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
