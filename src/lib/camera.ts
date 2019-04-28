import { Vector3 } from 'three'
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
