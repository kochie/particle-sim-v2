/**
 * Created by rkoch on 12/23/16.
 */

import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Vector3,
  AmbientLight,
  DirectionalLight,
} from 'three';
import Stats from 'stats.js';
import * as dat from 'dat.gui';
import { Proton, Electron } from './particle';
import {
  positionCamera,
  resetCamera,
  objectClick,
} from './camera';
import placeParticle from './gui';
import Environment from './environment';
import TrackballControls from './TrackballControls';
import buildAxes from './axis';

function animate(env) {
  env.particleGroup.calculateForceAll(env);
  env.particleGroup.updatePositionAll();
}

export function pattern(env) {
  env.addParticle(new Electron(new Vector3(-15, 0, 0)));
  env.addParticle(new Electron(new Vector3(15, 0, 0)));
  env.addParticle(new Proton(new Vector3(0, 5, 0)));
  env.addParticle(new Proton(new Vector3(2, 5, 2)));
  env.addParticle(new Proton(new Vector3(-2, 5, -2)));
}

export default function init() {
  const env = new Environment({
    scene: new Scene(),
    camera: new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    ),
    renderer: new WebGLRenderer({ antialias: true }),
    stats: new Stats(),
  });

  env.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(env.stats.dom);

  // const mesh = createTestObject();

  // const geometry = new THREE.WireframeGeometry(new THREE.TorusGeometry(10, 3, 16, 100));
  // const material = new THREE.MeshBasicMaterial({
  //     color: 0xffff00,
  //     wireframe: true
  // });
  // const cube = new THREE.Mesh(geometry, material);

  // env.scene.add(mesh);
  // env.meshObjects.push(mesh);

  env.controls = new TrackballControls(
    env.camera,
    env.renderer.domElement,
  );
  env.controls.enableDamping = true;
  env.controls.dampingFactor = 0.1;
  env.controls.enableZoom = false;
  env.controls.rotateSpeed = 8;

  // console.log(positionCamera);
  positionCamera(env, new Vector3(20, 20, 20));

  env.cameraStart.position = env.camera.position.clone();
  env.cameraStart.target = env.controls.target.clone();
  env.cameraStart.up = env.camera.up.clone();

  env.setAnimation(animate);

  function FizzyText() {
    this.speed = 0;
    this.resetCamera = () => {
      resetCamera(env);
    };
    this.moveCamera = () => {
      env.moveCamera();
    };
    this.placeParticle = () => {
      placeParticle(env);
    };
    this.stepAnimation = () => {
      animate(env);
    };
    this.pattern = () => {
      pattern(env);
    };
  }
  // const lights = [];
  // lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
  // lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
  // lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );
  //
  // lights[ 0 ].position.set( 0, 200, 0 );
  // lights[ 1 ].position.set( 100, 200, 100 );
  // lights[ 2 ].position.set( - 100, - 200, - 100 );
  //
  // env.scene.add( lights[ 0 ] );
  // env.scene.add( lights[ 1 ] );
  // env.scene.add( lights[ 2 ] );

  const light = new AmbientLight(0xffffff); // soft white light
  env.scene.add(light);

  const directionalLight1 = new DirectionalLight(0xffffff, 1);
  directionalLight1.position.set(0, 1, 0);
  env.scene.add(directionalLight1);

  const directionalLight2 = new DirectionalLight(0xffffff, 1);
  directionalLight2.position.set(0, -1, 0);
  env.scene.add(directionalLight2);

  window.addEventListener(
    'mousemove',
    (event) => {
      env.onMouseMove(event, env);
    },
    false,
  );
  document.addEventListener(
    'dblclick',
    () => {
      objectClick(env);
    },
    false,
  );

  // new Neutron(env, new THREE.Vector3(-4,0,4));
  // new Electron(env, new THREE.Vector3(-15, 0, 0));
  // new Electron(env, new THREE.Vector3(15, 0, 0));
  // new Proton(env, new THREE.Vector3(0, 5, 0));
  // new Proton(env, new THREE.Vector3(3, 5, 3));
  // new Proton(env, new THREE.Vector3(-3, 5, -3));

  // randomParticles(env, 10);
  // new Proton(env, new Vector3(0, 1, 0), new Vector3(0, 0, 1));

  // pattern(env);

  window.onload = () => {
    // console.log('Hello');
    env.text = new FizzyText();
    env.gui = new dat.GUI();
    env.speedController = env.gui
      .add(env.text, 'speed', 0, 100, 2)
      .listen();
    env.gui.add(env.text, 'resetCamera');
    env.gui.add(env.text, 'moveCamera');
    env.gui.add(env.text, 'placeParticle');
    env.gui.add(env.text, 'stepAnimation');
    env.gui.add(env.text, 'pattern');

    env.speedController.onChange((value) => {
      env.stepTime = 100 - value;
      env.setAnimation(animate);
    });

    setTimeout(() => {
      env.stepTime = 100;
      env.text.speed = 100 - env.stepTime;
      env.setAnimation(animate);
    }, 5000);
  };

  window.addEventListener(
    'resize',
    () => {
      env.onWindowResize();
    },
    false,
  );

  const axes = buildAxes();
  env.scene.add(axes);

  return env;
}
