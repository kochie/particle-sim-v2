import { WebGLRenderer, PerspectiveCamera, Scene, Vector3 } from "three";
import Stats from "stats.js";
import * as dat from "dat.gui";

import { Proton, Electron, Neutron } from "./particle";
import { positionCamera } from "./camera";
import placeParticle from "./gui";
import Environment from "./environment";
import TrackballControls from "./TrackballControls";
import buildAxes from "./axis";
import { BoundaryType, CollisionType, ParticleType, MessageReceiveType, SentMessage, MessageSendType } from "./messages";

// function animate(env: Environment): void {
// 	env.particleGroup.calculateForceAll(env);
// 	env.particleGroup.updatePositionAll();
// }

export function pattern(env: Environment): void {
	env.addParticle(new Vector3(-15, 0, 0), new Vector3(), -1, 1, 1);
	env.addParticle(new Vector3(15, 0, 0), new Vector3(), -1, 1, 1);
	env.addParticle(new Vector3(0, 5, 0), new Vector3(), 1, 1, 1);
	env.addParticle(new Vector3(2, 5, 2), new Vector3(), 1, 1, 1);
	env.addParticle(new Vector3(-2, 5, -2), new Vector3(), 1, 1, 1);
}

export function threeBody(env: Environment): void {
	const p1 = 0.347111;
	const p2 = 0.532728;
	env.addParticle(new Vector3(-1, 0, 0), new Vector3(p1, p2, 0), 0, 1, 1);
	env.addParticle(new Vector3(1, 0, 0), new Vector3(p1, p2, 0), 0, 1, 1);
	env.addParticle(new Vector3(0, 0, 0), new Vector3(-2 * p1, -2 * p2, 0), 0, 1, 1)
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
		// this.particleCount = env.particles.length.toString();
		this["Step Size"] = 0;
		this.gravity = 1;
		this.electro = 1;
		this.boundaryVisibility = true;
		this.boundaryType = BoundaryType.CLOSED;
		this.boundarySize = 50;
		this.collisionType = CollisionType.NONE
	}

	public resetCamera = () => {
		this.env.resetCamera();
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

	// public stepAnimation = () => {
	// 	animate(this.env);
	// };

	public pattern = () => {
		pattern(this.env);
	};

	public threeBody = () => {
		threeBody(this.env);
	};
}

export default function init(canvasElement: HTMLCanvasElement): Environment {
	let context = canvasElement.getContext('webgl2') as WebGLRenderingContext;
	if (context == undefined ) {
		context = canvasElement.getContext('webgl') || canvasElement.getContext('experimental-webgl')
	}
	const physicsWorker = new Worker('./physics-worker.ts');
	const env = new Environment({
		scene: new Scene(),
		camera: new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			10000
		),
		renderer: new WebGLRenderer({ antialias: true, context: context, canvas: canvasElement }),
		stats: new Stats(),
		physicsWorker
	});

	env.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild(env.stats.dom);

	env.controls = new TrackballControls(env.camera, canvasElement);
	// env.controls.enableDamping = true;
	// env.controls.dampingFactor = 0.1;
	// env.controls.enableZoom = false;
	env.controls.rotateSpeed = 8;

	positionCamera(env, new Vector3(20, 20, 20));

	env.cameraStart.position = env.camera.position.clone();
	env.cameraStart.target = env.controls.target.clone();
	env.cameraStart.up = env.camera.up.clone();

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
			env.objectClick();
		},
		false
	);

	physicsWorker.onmessage = function(e: MessageEvent): void {
		const message = e.data as SentMessage

		switch(message.type) {
			case MessageSendType.UPDATE_POSITIONS: {
		// console.log(message)
				message.uuid.forEach((uuid, i) => {
					const x = message.positions[i][0]
					const y = message.positions[i][1]
					const z = message.positions[i][2]
					env.updatePosition(uuid, new Vector3(x,y,z))
				}
					)
				break;
			}
			case MessageSendType.REMOVE_PARTICLE : {
				console.log("WOO",message)
				env.removeParticleMesh(message.uuid)
				break;
			}
			case MessageSendType.ADD_PARTICLE: {
				env.createParticleMesh(message.charge, message.radius, message.uuid)
				break;
			}
			default: {
				break;
			}
		}
	}

	window.onload = () => {
		env.text = new FizzyText(env);
		env.gui = new dat.GUI();
		// env.gui.add(env.text, "particleCount").listen();
		env.speedController = env.gui
			.add(env.text, "Step Size", 0, 0.01, 0.0005)
			.listen();
		env.gui.add(env.text, "resetCamera");
		env.gui.add(env.text, "moveCamera");
		env.gui.add(env.text, "placeParticle");
		env.gui.add(env.text, "placeSpeedyParticle");
		env.gui.add(env.text, "neutron");
		env.gui.add(env.text, "electron");
		env.gui.add(env.text, "proton");
		// env.gui.add(env.text, "stepAnimation");
		env.gui.add(env.text, "pattern");
		env.gui.add(env.text, "threeBody");
		env.gui.add(env.text, "gravity", 0, 10).onChange((value: number) => {
			physicsWorker.postMessage({
				type: MessageReceiveType.UPDATE_GRAVITY,
				value
			})
		});
		env.gui.add(env.text, "electro", 0, 10).onChange((value: number) => {
			physicsWorker.postMessage({
				type: MessageReceiveType.UPDATE_ELECTO,
				value
			})
		});
		env.gui
			.add(env.text, "boundaryVisibility")
			.onChange(() => env.toggleBoundaryVisibility());
		env.gui
			.add(env.text, "boundarySize", 1, 500, 1)
			.onChange((value: number) => env.changeBoundarySize(value));
		env.gui
			.add(env.text, "boundaryType", [
				BoundaryType.NONE,
				BoundaryType.CLOSED,
				BoundaryType.DELETE,
				BoundaryType.TORUS
			])
			.onChange((value: BoundaryType) => env.changeBoundaryType(value));
		env.gui
			.add(env.text, "collisionType", [
				CollisionType.ABSORB,
				CollisionType.BOUNCE,
				CollisionType.NONE
			])
			.onChange((value: CollisionType) => env.changeCollisionType(value))
		env.speedController.onChange((value: number) => {
			env.updateStepSize(value)
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
