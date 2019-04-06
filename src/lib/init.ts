import { WebGLRenderer, PerspectiveCamera, Scene, Vector3 } from "three";
import Stats from "stats.js";
import * as dat from "dat.gui";

import { Proton, Electron, Neutron, BoundaryType, CollisionType } from "./particle";
import { positionCamera, resetCamera, objectClick } from "./camera";
import placeParticle, { ParticleType } from "./gui";
import Environment from "./environment";
import TrackballControls from "./TrackballControls";
import buildAxes from "./axis";

function animate(env: Environment): void {
	env.particleGroup.calculateForceAll(env);
	env.particleGroup.updatePositionAll();
}

export function pattern(env: Environment): void {
	env.addParticle(new Electron(new Vector3(-15, 0, 0)));
	env.addParticle(new Electron(new Vector3(15, 0, 0)));
	env.addParticle(new Proton(new Vector3(0, 5, 0)));
	env.addParticle(new Proton(new Vector3(2, 5, 2)));
	env.addParticle(new Proton(new Vector3(-2, 5, -2)));
}

export function threeBody(env: Environment): void {
	const p1 = 0.347111;
	const p2 = 0.532728;
	env.addParticle(new Neutron(new Vector3(-1, 0, 0), new Vector3(p1, p2, 0)));
	env.addParticle(new Neutron(new Vector3(1, 0, 0), new Vector3(p1, p2, 0)));
	env.addParticle(
		new Neutron(new Vector3(0, 0, 0), new Vector3(-2 * p1, -2 * p2))
	);
}

export class FizzyText {
	public particleCount: string;
	public speed: number;
	public gravity: number;
	public electro: number;
	public boundaryVisibility: boolean;
	public boundaryType: BoundaryType;
	public boundarySize: number;
	public env: Environment;
	public collisionType: CollisionType

	public constructor(env: Environment) {
		this.env = env;
		this.particleCount = env.particleGroup.particles.length.toString();
		this.speed = 0;
		this.gravity = 1;
		this.electro = 1;
		this.boundaryVisibility = true;
		this.boundaryType = BoundaryType.CLOSED;
		this.boundarySize = 50;
		this.collisionType = CollisionType.ABSORB
	}

	public resetCamera = () => {
		resetCamera(this.env);
	};

	public moveCamera = () => {
		this.env.moveCamera();
	};

	public placeParticle = () => {
		placeParticle(this.env, { type: ParticleType.RANDOM, speedy: false });
	};

	public placeSpeedyParticle = () => {
		placeParticle(this.env, { type: ParticleType.RANDOM, speedy: true });
	};

	public neutron = () => {
		placeParticle(this.env, { type: ParticleType.NEUTRON, speedy: false });
	};

	public electron = () => {
		placeParticle(this.env, { type: ParticleType.ELECTRON, speedy: false });
	};

	public proton = () => {
		placeParticle(this.env, { type: ParticleType.PROTON, speedy: false });
	};

	public stepAnimation = () => {
		animate(this.env);
	};

	public pattern = () => {
		pattern(this.env);
	};

	public threeBody = () => {
		threeBody(this.env);
	};
}

export default function init(canvasElement: HTMLDivElement): Environment {
	const env = new Environment({
		scene: new Scene(),
		camera: new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			10000
		),
		renderer: new WebGLRenderer({ antialias: true }),
		stats: new Stats()
	});

	canvasElement.appendChild(env.renderer.domElement);

	env.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild(env.stats.dom);

	env.controls = new TrackballControls(env.camera, env.renderer.domElement);
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

	window.addEventListener(
		"mousemove",
		(event: MouseEvent) => {
			env.onMouseMove(event);
		},
		false
	);
	document.addEventListener(
		"dblclick",
		() => {
			objectClick(env);
		},
		false
	);

	window.onload = () => {
		env.text = new FizzyText(env);
		env.gui = new dat.GUI();
		env.gui.add(env.text, "particleCount").listen();
		env.speedController = env.gui
			.add(env.text, "speed", 0, 100, 2)
			.listen();
		env.gui.add(env.text, "resetCamera");
		env.gui.add(env.text, "moveCamera");
		env.gui.add(env.text, "placeParticle");
		env.gui.add(env.text, "placeSpeedyParticle");
		env.gui.add(env.text, "neutron");
		env.gui.add(env.text, "electron");
		env.gui.add(env.text, "proton");
		env.gui.add(env.text, "stepAnimation");
		env.gui.add(env.text, "pattern");
		env.gui.add(env.text, "threeBody");
		env.gui.add(env.text, "gravity", 0, 10).onChange((value: number) => {
			env.particleGroup.gravity = value;
		});
		env.gui.add(env.text, "electro", 0, 10).onChange((value: number) => {
			env.particleGroup.electro = value;
		});
		env.gui
			.add(env.text, "boundaryVisibility")
			.onChange(() => env.particleGroup.toggleBoundaryVisibility());
		env.gui
			.add(env.text, "boundarySize", 1, 500, 1)
			.onChange((value: number) => env.particleGroup.changeBoundarySize(value));
		env.gui
			.add(env.text, "boundaryType", [
				BoundaryType.NONE,
				BoundaryType.CLOSED,
				BoundaryType.DELETE,
				BoundaryType.TORUS
			])
			.onChange((value: BoundaryType) => env.particleGroup.changeBoundaryType(value));
		env.gui
			.add(env.text, "collisionType", [
				CollisionType.ABSORB,
				CollisionType.BOUNCE,
				CollisionType.NONE
			])
			.onChange((value: CollisionType) => env.particleGroup.changeCollisionType(value))
		env.speedController.onChange((value: number) => {
			env.stepTime = 100 - value;
			env.setAnimation(animate);
		});
	};

	window.addEventListener(
		"resize",
		() => {
			env.onWindowResize();
		},
		false
	);

	const axes = buildAxes();
	env.scene.add(axes);

	return env;
}
