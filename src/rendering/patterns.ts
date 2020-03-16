import Environment from './environment'
import { Vector3 } from 'three'

export function pattern(env: Environment): void {
	env.addParticle(new Vector3(-15, 0, 0), new Vector3(), -1, 1, 1)
	env.addParticle(new Vector3(15, 0, 0), new Vector3(), -1, 1, 1)
	env.addParticle(new Vector3(0, 5, 0), new Vector3(), 1, 1, 1)
	env.addParticle(new Vector3(2, 5, 2), new Vector3(), 1, 1, 1)
	env.addParticle(new Vector3(-2, 5, -2), new Vector3(), 1, 1, 1)
}

export function threeBody(env: Environment): void {
	const p1 = 0.347111
	const p2 = 0.532728
	env.addParticle(new Vector3(-1, 0, 0), new Vector3(p1, p2, 0), 0, 1, 1)
	env.addParticle(new Vector3(1, 0, 0), new Vector3(p1, p2, 0), 0, 1, 1)
	env.addParticle(
		new Vector3(0, 0, 0),
		new Vector3(-2 * p1, -2 * p2, 0),
		0,
		1,
		1,
	)
}
