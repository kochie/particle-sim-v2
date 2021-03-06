import { Particle } from '../rendering/particle'
import { Vector3 } from 'three'
import Field from '../rendering/fields'
import { CollisionType } from '../emun/CollisionType'
import { BoundaryType } from '../emun/BoundaryType'
import { MessageSendType } from '../emun/MessageSendType'
import { v4 as uuidv4 } from 'uuid'

export class World {
	private electro: number
	private gravity: number
	private stepSize: number
	private boundary: {
		type: BoundaryType
		size: number
	}
	private collisionType: CollisionType
	private centerOfMass: Vector3
	private groupVelocity: Vector3
	private groupAcceleration: Vector3
	private particles: Particle[]
	private sumForce: Vector3[]
	private magneticField: Field
	private electricField: Field
	private gravityField: Field
	private tick: number
	private tock: number

	public constructor() {
		this.tick = 0
		this.tock = performance.now()
		this.electro = 1
		this.gravity = 1
		this.stepSize = 0
		this.boundary = {
			type: BoundaryType.CLOSED,
			size: 50,
		}
		this.collisionType = CollisionType.NONE
		this.centerOfMass = new Vector3()
		this.groupVelocity = new Vector3()
		this.groupAcceleration = new Vector3()
		this.particles = []
		this.magneticField = new Field()
		this.electricField = new Field()
		this.gravityField = new Field()
		this.sumForce = []

		// setInterval((): void => {
		// 	console.log(this.particles.length)
		// 	console.log(
		// 		`Number of physics ticks - ${this.tick} in ${performance.now() -
		// 			this.tock}ms`,
		// 	)
		// 	this.tick = 0
		// 	this.tock = performance.now()
		// }, 1000)
	}

	public calcGroupVelocity(): Vector3 {
		this.groupVelocity = new Vector3()
		this.particles.forEach((particle: Particle): void => {
			this.groupVelocity.add(particle.velocity)
		})
		return this.groupVelocity
	}

	public calcGroupAcceleration(): Vector3 {
		this.groupAcceleration = new Vector3()
		this.particles.forEach((particle: Particle): void => {
			this.groupAcceleration.add(particle.acceleration)
		})
		return this.groupAcceleration
	}

	public calcCenterOfMass(): Vector3 {
		let totalMass = 0
		this.centerOfMass = new Vector3()
		this.particles.forEach((particle: Particle): void => {
			totalMass += particle.mass
			this.centerOfMass.add(particle.position.multiplyScalar(particle.mass))
		})
		this.centerOfMass.divideScalar(totalMass)
		return this.centerOfMass
	}

	public changeBoundarySize(size: number): void {
		this.boundary.size = size
		this.particles.forEach((particle: Particle): void => {
			if (particle.position.x + particle.radius > size) {
				particle.position.x = (particle.position.x % size) - size
			}
			if (particle.position.x - particle.radius < -size) {
				particle.position.x = (particle.position.x % size) + size
			}
			if (particle.position.y + particle.radius > size) {
				particle.position.y = (particle.position.y % size) - size
			}
			if (particle.position.y - particle.radius < -size) {
				particle.position.y = (particle.position.y % size) + size
			}
			if (particle.position.z + particle.radius > size) {
				particle.position.z = (particle.position.z % size) - size
			}
			if (particle.position.z - particle.radius < -size) {
				particle.position.z = (particle.position.z % size) + size
			}
		})
	}

	public boundaryBox(particle: Particle): void {
		const decay = 0.95
		const size = this.boundary.size
		const boundaryType = this.boundary.type
		const radius = particle.radius
		switch (boundaryType) {
			case BoundaryType.CLOSED: {
				if (particle.position.x + radius > size) {
					particle.velocity.x = -particle.velocity.x
					particle.position.x = size - radius
					particle.velocity = particle.velocity.multiplyScalar(decay)
				}
				if (particle.position.x - radius < -size) {
					particle.velocity.x = -particle.velocity.x
					particle.position.x = radius - size
					particle.velocity = particle.velocity.multiplyScalar(decay)
				}
				if (particle.position.y + radius > size) {
					particle.velocity.y = -particle.velocity.y
					particle.position.y = size - radius
					particle.velocity = particle.velocity.multiplyScalar(decay)
				}
				if (particle.position.y - radius < -size) {
					particle.velocity.y = -particle.velocity.y
					particle.position.y = radius - size
					particle.velocity = particle.velocity.multiplyScalar(decay)
				}
				if (particle.position.z + radius > size) {
					particle.velocity.z = -particle.velocity.z
					particle.position.z = size - radius
					particle.velocity = particle.velocity.multiplyScalar(decay)
				}
				if (particle.position.z - radius < -size) {
					particle.velocity.z = -particle.velocity.z
					particle.position.z = radius - size
					particle.velocity = particle.velocity.multiplyScalar(decay)
				}
				break
			}
			case BoundaryType.TORUS: {
				if (particle.position.x > size) {
					particle.position.x = (particle.position.x % size) - size
				}
				if (particle.position.x < -size) {
					particle.position.x = (particle.position.x % size) + size
				}
				if (particle.position.y > size) {
					particle.position.y = (particle.position.y % size) - size
				}
				if (particle.position.y < -size) {
					particle.position.y = (particle.position.y % size) + size
				}
				if (particle.position.z > size) {
					particle.position.z = (particle.position.z % size) - size
				}
				if (particle.position.z < -size) {
					particle.position.z = (particle.position.z % size) + size
				}
				break
			}
			case BoundaryType.DELETE: {
				if (
					particle.position.x > size ||
					particle.position.y > size ||
					particle.position.z > size ||
					particle.position.x < -size ||
					particle.position.y < -size ||
					particle.position.z < -size
				) {
					this.removeParticle(particle.uuid)
					postMessage({
						type: MessageSendType.REMOVE_PARTICLE,
						uuid: particle.uuid,
					})
				}
				break
			}
			case BoundaryType.NONE:
			default: {
				break
			}
		}
	}

	public updatePositionAll(): void {
		this.particles.forEach((particle: Particle): void =>
			particle.calcAcceleration(),
		)
		this.particles.forEach((particle: Particle): void =>
			particle.calcKinematics(this.stepSize),
		)
		this.particles.forEach((particle: Particle): void =>
			this.boundaryBox(particle),
		)
		for (let i = 0; i < this.particles.length - 1; i++) {
			for (let j = i + 1; j < this.particles.length; j++) {
				this.calculateCollision(this.particles[i], this.particles[j])
			}
		}

		const tick = performance.now()
		const positionsX = new Float64Array(this.particles.length)
		const positionsY = new Float64Array(this.particles.length)
		const positionsZ = new Float64Array(this.particles.length)

		this.particles.forEach((particle: Particle, index: number): void => {
			positionsX[index] = particle.position.x
			positionsY[index] = particle.position.y
			positionsZ[index] = particle.position.z
		})

		const uuid = this.particles.map(
			(particle: Particle): string => particle.uuid,
		)

		postMessage(
			{
				type: MessageSendType.UPDATE_POSITIONS,
				positionsX,
				positionsY,
				positionsZ,
				uuid,
			},
			[positionsX.buffer, positionsY.buffer, positionsZ.buffer],
		)
		const deltaT = performance.now() - tick
		if (deltaT > 100) {
			console.log(`Post time: ${deltaT}ms`)
		}
	}

	public calculateCollision(particle1: Particle, particle2: Particle): void {
		if (
			particle1.position.distanceTo(particle2.position) <
			particle1.radius + particle2.radius
		) {
			switch (this.collisionType) {
				case CollisionType.BOUNCE: {
					this.bounceCollision(particle1, particle2)
					break
				}
				case CollisionType.ABSORB: {
					this.absorbCollision(particle1, particle2)
					break
				}
				default: {
				}
			}
		}
	}

	private bounceCollision(particle1: Particle, particle2: Particle): void {
		const radius2 = particle1.radius + particle2.radius

		const particleVel = particle1.velocity.clone().sub(particle2.velocity)
		const particleDist = particle1.position.clone().sub(particle2.position)

		const g1 =
			(particleVel.clone().dot(particleDist) / particleDist.lengthSq()) *
			((2 * particle2.mass) / (particle1.mass + particle2.mass))
		const newVelocity1 = new Vector3().subVectors(
			particle1.velocity,
			particleDist.clone().multiplyScalar(g1),
		)

		const g2 =
			(particleVel
				.clone()
				.negate()
				.dot(particleDist.clone().negate()) /
				particleDist.lengthSq()) *
			((2 * particle1.mass) / (particle1.mass + particle2.mass))
		const newVelocity2 = new Vector3().subVectors(
			particle2.velocity,
			particleDist
				.clone()
				.negate()
				.multiplyScalar(g2),
		)

		const c = particle2.position.clone().sub(particle1.position)
		const d = (radius2 - c.length()) / 2

		particle1.position.sub(
			c
				.clone()
				.normalize()
				.multiplyScalar(d),
		)
		particle2.position.add(
			c
				.clone()
				.normalize()
				.multiplyScalar(d),
		)

		particle1.velocity.copy(newVelocity1.multiplyScalar(1))
		particle2.velocity.copy(newVelocity2.multiplyScalar(1))
	}

	private absorbCollision(particle1: Particle, particle2: Particle): void {
		const mass = particle1.mass + particle2.mass
		const charge = particle1.charge + particle2.charge
		const radius = Math.pow(
			Math.pow(particle1.radius, 3) + Math.pow(particle2.radius, 3),
			1 / 3,
		)
		// 		const velocity = new Vector3().addVectors(
		// 			particle1.velocity,
		// 			particle2.velocity,
		// 		)

		const velocity = new Vector3().addVectors(
			particle1.velocity
				.clone()
				.multiplyScalar(particle1.mass / (particle1.mass + particle2.mass)),
			particle2.velocity
				.clone()
				.multiplyScalar(particle2.mass / (particle1.mass + particle2.mass)),
		)

		const position = this.centerOfMass2(particle1, particle2)

		const uuid = uuidv4()
		this.removeParticle(particle1.uuid)
		this.removeParticle(particle2.uuid)
		this.addParticle(
			new Particle(uuid, charge, position, velocity, radius, mass),
		)
		postMessage({
			type: MessageSendType.REMOVE_PARTICLE,
			uuid: particle1.uuid,
		})
		postMessage({
			type: MessageSendType.REMOVE_PARTICLE,
			uuid: particle2.uuid,
		})

		postMessage({
			type: MessageSendType.ADD_PARTICLE,
			uuid,
			position,
			velocity,
			charge,
			mass,
			radius,
		})
		console.log('length', this.particles.length)
	}

	private centerOfMass2(particle1: Particle, particle2: Particle): Vector3 {
		const m1 = particle1.position.multiplyScalar(particle1.mass)
		const m2 = particle2.position.multiplyScalar(particle2.mass)
		return new Vector3()
			.addVectors(m1, m2)
			.divideScalar(particle1.mass + particle2.mass)
	}

	public calculateForceAll(): void {
		/*
            |(1,1) (1,2) (1,3)|
            |(2,1) (2,2) (2,3)|
            |(3,1) (3,2) (3,3)|

            [(1,2) (1,3) (2,3)]
            */

		for (let i = 1; i < this.particles.length; i += 1) {
			for (let j = i + 1; j <= this.particles.length; j += 1) {
				this.updateForce(i, j)
			}
		}

		for (let i = 0; i < this.particles.length; i += 1) {
			this.particles[i].force = this.calculateForceOn(i + 1)
		}
	}

	public addParticle(particle: Particle): void {
		this.particles.push(particle)
		if (this.particles.length > 1) {
			this.sumForce.push(new Vector3())
		}
	}

	public removeParticle(uuid: string): void {
		const index = this.particles.findIndex(
			(particle: Particle): boolean => particle.uuid === uuid,
		)
		this.particles.splice(index, 1)
		this.sumForce.pop()
	}

	/**
	 * getForceValue will get the force vector between the i_th particle and the j_th particle.
	 * @param i particle 1
	 * @param j particle 2
	 */
	private getForceValue(i: number, j: number): Vector3 {
		if (i < j) {
			return this.sumForce[this.index(i, j)]
		} else if (i > j) {
			return this.sumForce[this.index(j, i)].clone().multiplyScalar(-1)
		} else {
			return new Vector3()
		}
	}

	/**
	 * Will calculate the total force on the i_th particle.
	 * @param i the particle index number to calculate the force on
	 * @returns {Vector3} the force on the selected particle
	 */
	public calculateForceOn(i: number): Vector3 {
		const value = new Vector3()
		for (let x = 1; x <= this.particles.length; x += 1) {
			value.add(this.getForceValue(i, x))
		}

		const particle = this.particles[i - 1]

		const E = this.getElectricField(particle.position)
		const B = this.getMagneticField(particle.position)
		const G = this.getGravityField(particle.position)

		const fieldForce = particle.calcForce(E, B, G)
		value.add(fieldForce)
		return value
	}

	/**
     * The index of the column.
     * 
     * @param {number} i the row element
     * @param {number} j the column element
     * @returns {number} the index in the sumForce array
     * 
     * The forces on the particles are represented virtually as a 2x2 array like below. 
     *        
     * ```
       |(1,1) (1,2) (1,3) (1,4) (1,5)|
       |(2,1) (2,2) (2,3) (2,4) (2,5)|
       |(3,1) (3,2) (3,3) (3,4) (3,5)|
       |(4,1) (4,2) (4,3) (4,4) (4,5)|
       |(5,1) (5,2) (5,3) (5,4) (5,5)|
       ```
     * 
     * However because this is an inefficient way to store the data, the sumForce array is optimised to only store values that are unique, like below;
     * 
     * ```
       [(1,2) (1,3) (1,4) (1,5) (2,3) (2,4) (2,5) (3,4) (3,5) (4,5)]
       ```
     * 
     * The formula to convert from the 2 dimensional matrix to the array is
     * 
     * ```
       (i - 1) * (n) + (j - 1) - i * (i + 1) / 2
       ```
     */
	private index(i: number, j: number): number {
		return (i - 1) * this.particles.length + (j - 1) - (i * (i + 1)) / 2
	}

	/**
	 * updateForce will calculate the force between two particles, given their index values in the sum force array.
	 *
	 * @param i particle 1
	 * @param j particle 2
	 */
	private updateForce(i: number, j: number): void {
		const p1 = this.particles[i - 1].position.clone()
		const p2 = this.particles[j - 1].position.clone()

		const m1 = this.particles[i - 1].mass
		const m2 = this.particles[j - 1].mass

		const q1 = this.particles[i - 1].charge
		const q2 = this.particles[j - 1].charge

		const G = this.gravity
		const K = this.electro

		const r2 = p1.distanceToSquared(p2)
		this.sumForce[this.index(i, j)] = p1
			.sub(p2)
			.normalize()
			.multiplyScalar((q1 * q2 * K - m1 * m2 * G) / r2)
	}

	/**
	 * update will run a step in the simulation and update the positions of the particles
	 */
	public update(): void {
		this.calculateForceAll()
		this.updatePositionAll()
		this.tick++
	}

	/**
	 * setElectro will update the electromagnetic constant
	 * @param {number} value the value of the constant
	 */
	public setElectro(value: number): void {
		this.electro = value
	}

	/**
	 * setGravity will update the gravitational constant
	 * @param {number} value the value of the constant
	 */
	public setGravity(value: number): void {
		this.gravity = value
	}

	/**
	 * setStepSize will update the step size used in simulation solvers
	 * @param {number} value the new step size
	 */
	public setStepSize(value: number): void {
		this.stepSize = value
	}

	/**
	 * setBoundaryType will set the type of the boundary
	 * @param {BoundaryType} value the type of boundary
	 */
	public setBoundaryType(value: BoundaryType): void {
		this.boundary.type = value
	}

	/**
	 * setBoundarySize will set the size of the boundary
	 * @param {number} value the size of the boundary
	 */
	public setBoundarySize(value: number): void {
		this.boundary.size = value
	}

	/**
	 * getBoundarySize will return the size of the boundary
	 * @returns {number} the boundary size
	 */
	public getBoundarySize(): number {
		return this.boundary.size
	}

	/**
	 * setCollisionType will update the collision type
	 * @param {CollisionType} value the collision type
	 */
	public setCollisionType(value: CollisionType): void {
		this.collisionType = value
	}

	/**
	 * getMagneticField will return the stength of the magnetic field at the given position
	 * @param {Vector3} position the position to check the stength at
	 * @returns {Vector3} the stength of this position
	 */
	public getMagneticField(position: Vector3): Vector3 {
		return this.magneticField.getValue(position)
	}

	/**
	 * getElectricField will return the stength of the electric field at the given position
	 * @param {Vector3} position the position to check the stength at
	 * @returns {Vector3} the stength of this position
	 */
	public getElectricField(position: Vector3): Vector3 {
		return this.electricField.getValue(position)
	}

	/**
	 * getGravityField will return the stength of the gravitational field at the given position
	 * @param {Vector3} position the position to check the stength at
	 * @returns {Vector3} the stength of this position
	 */
	public getGravityField(position: Vector3): Vector3 {
		return this.gravityField.getValue(position)
	}
}
