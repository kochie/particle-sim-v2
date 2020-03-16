import Environment from '../environment'
import { ParticleColors } from "../../emun/ParticleColors"
import {
	Scene,
	PerspectiveCamera,
	Vector3,
	MeshBasicMaterial,
	Color,
	WebGLRenderer,
} from 'three'
import { JSDOM } from 'jsdom'
import { MessageReceiveType } from "../../emun/MessageReceiveType"

function createEnv(): Environment {
	const canvasElement = new JSDOM('<canvas></canvas>')
	canvasElement.getEventListener = jest.fn()

	return new Environment({
		scene: new Scene(),
		camera: new PerspectiveCamera(),
		renderer: {
			setPixelRatio: jest.fn(),
			setSize: jest.fn(),
			setClearColor: jest.fn(),
		},
		stats: jest.fn(),
		physicsWorker: {
			postMessage: jest.fn(),
		},
	})
}

describe('Environment', (): void => {
	it('should create class', (): void => {
		const env = createEnv()
		expect(env).toBeDefined()
	})

	it('should select the closest particle under the mouse', (): void => {
		const env = createEnv()

		env.objectClick()
	})

	it('should set the default color of a particle [POSITIVE]', (): void => {
		const env = createEnv()
		const uuid = env.addParticle(new Vector3(0, 0, 0), new Vector3(), 1, 1, 1)
		const mesh = env.getMesh(uuid)
		const meshColor = (mesh.material as MeshBasicMaterial).color

		meshColor.set(new Color(0x0))
		env.setDefaultColour(uuid)
		expect(meshColor).toEqual(new Color(ParticleColors.POSITIVE))
	})

	it('should set the default color of a particle [NEGATIVE]', (): void => {
		const env = createEnv()
		const uuid = env.addParticle(new Vector3(0, 0, 0), new Vector3(), -1, 1, 1)
		const mesh = env.getMesh(uuid)
		const meshColor = (mesh.material as MeshBasicMaterial).color

		meshColor.set(new Color(0x0))
		env.setDefaultColour(uuid)
		expect(meshColor).toEqual(new Color(ParticleColors.NEGATIVE))
	})

	it('should set the default color of a particle [NEUTRAL]', (): void => {
		const env = createEnv()
		const uuid = env.addParticle(new Vector3(0, 0, 0), new Vector3(), 0, 1, 1)
		const mesh = env.getMesh(uuid)
		const meshColor = (mesh.material as MeshBasicMaterial).color

		meshColor.set(new Color(0x0))
		env.setDefaultColour(uuid)
		expect(meshColor).toEqual(new Color(ParticleColors.NEUTRAL))
	})

	it('should get a mesh', (): void => {
		const env = createEnv()
		const uuid = env.addParticle(new Vector3(0, 0, 0), new Vector3(), 0, 1, 1)
		const mesh = env.getMesh(uuid)

		expect(mesh).toBeDefined()
	})

	it('should add particle', (): void => {
		const env = createEnv()

		env.addParticle(new Vector3(), new Vector3(), 0, 0, 0)
		expect(env.meshMap.size).toBe(1)
		expect(env.colorMap.size).toBe(1)
	})

	it('should remove a particle', (): void => {
		const env = createEnv()

		const uuid = env.addParticle(new Vector3(), new Vector3(), 0, 0, 0)
		expect(env.meshMap.size).toBe(1)
		expect(env.colorMap.size).toBe(1)

		env.removeParticle(uuid)
		expect(env.meshMap.size).toBe(0)
		expect(env.colorMap.size).toBe(0)
		expect(env.physicsWorker.postMessage).toBeCalledWith({
			type: MessageReceiveType.REMOVE_PARTICLE,
			uuid,
		})
	})

	it('should update mouse position', (): void => {
		const env = createEnv()
		window.innerHeight = 40
		window.innerWidth = 40
		env.onMouseMove({ clientX: 40, clientY: 40 })

		expect(env.mouse).toEqual({ x: 1, y: -1 })
	})
})
