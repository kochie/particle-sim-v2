import { BoundaryType } from '../emun/BoundaryType'
import Environment from './environment'
import { CollisionType } from '../emun/CollisionType'
import { ParticleType } from '../emun/ParticleType'
import placeParticle from './gui'
import { pattern, threeBody } from './patterns'
import * as dat from 'dat.gui'
import { MessageReceiveType } from '../emun/MessageReceiveType'
import { GetWorker } from '../engine/worker'
import { getBoundary } from './boundary'

const worker = GetWorker()
const boundary = getBoundary()

class FizzyText {
	public particleCount: number
	public stepSize: number
	public gravity: number
	public electro: number
	public boundaryVisibility: boolean
	public boundaryType: BoundaryType
	public boundarySize: number
	public env: Environment
	public collisionType: CollisionType

	public constructor(env: Environment) {
		this.stepSize = 0
		this.gravity = 1
		this.electro = 1
		this.boundaryVisibility = true
		this.boundaryType = BoundaryType.CLOSED
		this.boundarySize = 50
		this.collisionType = CollisionType.NONE
		this.env = env
		this.particleCount = 0
	}

	public resetCamera = () => {
		this.env.deselectObject()
		this.env.camera.resetCamera()
		this.env.controls.target.set(0, 0, 0)
	}

	public placeParticle = (): void => {
		placeParticle(this.env, { type: ParticleType.RANDOM, speedy: false })
	}

	public placeSpeedyParticle = (): void => {
		placeParticle(this.env, { type: ParticleType.RANDOM, speedy: true })
	}

	public neutron = (): void => {
		placeParticle(this.env, { type: ParticleType.NEUTRON, speedy: false })
	}

	public electron = (): void => {
		placeParticle(this.env, { type: ParticleType.ELECTRON, speedy: false })
	}

	public proton = (): void => {
		placeParticle(this.env, { type: ParticleType.PROTON, speedy: false })
	}

	public pattern = (): void => {
		pattern(this.env)
	}

	public threeBody = (): void => {
		threeBody(this.env)
	}
}

export const setupSidebar = (env: Environment) => {
	const text = new FizzyText(env)
	const gui = new dat.GUI()
	// document.body.appendChild(gui.domElement)
	const speedController = gui.add(text, 'stepSize', 0, 0.01, 0.0005).listen()
	gui.add(text, 'resetCamera')
	gui.add(text, 'placeParticle')
	gui.add(text, 'placeSpeedyParticle')
	gui.add(text, 'neutron')
	gui.add(text, 'electron')
	gui.add(text, 'proton')
	gui.add(text, 'pattern')
	gui.add(text, 'threeBody')
	gui.add(text, 'gravity', 0, 10).onChange((value: number): void => {
		worker.postMessage({
			type: MessageReceiveType.UPDATE_GRAVITY,
			value,
		})
	})
	gui.add(text, 'electro', 0, 10).onChange((value: number): void => {
		worker.postMessage({
			type: MessageReceiveType.UPDATE_ELECTO,
			value,
		})
	})
	gui
		.add(text, 'boundaryVisibility')
		.onChange((): void => boundary.toggleBoundaryVisibility())
	gui
		.add(text, 'boundarySize', 1, 500, 1)
		.onChange((value: number): void => boundary.changeBoundarySize(value))
	gui
		.add(text, 'boundaryType', [
			BoundaryType.NONE,
			BoundaryType.CLOSED,
			BoundaryType.DELETE,
			BoundaryType.TORUS,
		])
		.onChange((value: BoundaryType): void => boundary.changeBoundaryType(value))
	gui
		.add(text, 'collisionType', [
			CollisionType.ABSORB,
			CollisionType.BOUNCE,
			CollisionType.NONE,
		])
		.onChange((value: CollisionType): void => env.changeCollisionType(value))
	speedController.onChange((value: number): void => {
		env.updateStepSize(value)
	})
}
