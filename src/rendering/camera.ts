import { Vector3, PerspectiveCamera } from 'three'
import Environment from './environment'

export function positionCamera(
	env: Environment,
	position: Vector3 = new Vector3(0, 0, 0),
	target: Vector3 = new Vector3(0, 0, 0),
	up: Vector3 = new Vector3(0, 1, 0),
): void {
	env.camera.position.copy(position)
	env.controls.target.copy(target)
	env.camera.up.copy(up)
	env.controls.update()
}

export class ParticleCamera extends PerspectiveCamera {
	constructor() {
		super(75, window.innerWidth / window.innerHeight, 0.1, 10000)
		this.position.set(50, 50, 50)
	}

	resetCamera() {
		this.position.set(50, 50, 50)
		// this.lookAt(0, 0, 0)
		this.up = new Vector3(0, 1, 0)
		this.lookAt(new Vector3(0, 0, 0))
		// console.log(this)
	}
}
