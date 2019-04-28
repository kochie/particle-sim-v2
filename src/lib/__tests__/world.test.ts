import { World } from '../world'
import { Vector3 } from 'three'
import { Particle } from '../particle'

function initWorld(): { world: World; particles: Particle[] } {
	const w = new World()
	const particles = [
		new Particle('1', 1, new Vector3(1, 1, 1), new Vector3(1, 1, 1), 1, 1),
		new Particle('2', 1, new Vector3(1, 1, -1), new Vector3(1, 1, 1), 1, 1),
		new Particle('3', 1, new Vector3(1, -1, 1), new Vector3(1, 1, 1), 1, 1),
		new Particle('4', 1, new Vector3(1, -1, -1), new Vector3(1, 1, 1), 1, 1),
		new Particle('5', 1, new Vector3(-1, 1, 1), new Vector3(1, 1, 1), 1, 1),
		new Particle('6', 1, new Vector3(-1, 1, -1), new Vector3(1, 1, 1), 1, 1),
		new Particle('7', 1, new Vector3(-1, -1, 1), new Vector3(1, 1, 1), 1, 1),
		new Particle('8', 1, new Vector3(-1, -1, -1), new Vector3(1, 1, 1), 1, 1),
	]
	particles.forEach((p: Particle): void => w.addParticle(p))
	return { world: w, particles }
}

describe('world tests', (): void => {
	it('should create the world', (): void => {
		const w = new World()
		expect(w).toBeDefined()
	})

	it('should calculate group velocity', (): void => {
		const { world } = initWorld()
		const groupVelocity = world.calcGroupVelocity()
		expect(groupVelocity).toEqual(new Vector3(8, 8, 8))
	})

	it('should calculate group acceleration', (): void => {
		const { world, particles } = initWorld()
		particles.forEach(
			(particle: Particle): void => {
				particle.acceleration.copy(new Vector3(2, 2, 2))
			},
		)
		const groupAcceleration = world.calcGroupAcceleration()
		expect(groupAcceleration).toEqual(new Vector3(16, 16, 16))
	})

	it('should calculate group center of mass', (): void => {
		const { world } = initWorld()
		const centerOfMass = world.calcCenterOfMass()
		expect(centerOfMass).toEqual(new Vector3(0, 0, 0))
	})
})
