import { Raycaster, Vector2 } from "three";
import { ParticleGroup } from "./particle.js";
import { RingGroup } from "./torus.js";
import { Field } from "./fields.js";

export class Environment {
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
			window.devicePixelRatio ? window.devicePixelRatio : 1
		);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0x000000, 1);
		document.body.appendChild(this.renderer.domElement);

		this.magneticField = new Field(
			(x, y, z) => {
				return Math.sin(x) * y + z;
			},
			(x, y, z) => {
				return Math.sin(x) * y;
			},
			(x, y, z) => {
				return 0;
			}
		);

		this.electricField = new Field();
	}

	setAnimation(animation) {
		const _this = this;
		if (typeof this.intervalId === "undefined") {
		} else {
			clearInterval(this.intervalId);
		}
		if (this.stepTime == 100) {
		} else {
			this.intervalId = setInterval(function() {
				animation(_this);
			}, this.stepTime);
		}
	}
}
