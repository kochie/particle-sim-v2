import {
	Raycaster,
	Vector2,
	Vector3,
	Scene,
	WebGLRenderer,
	Mesh,
	Intersection,
	Color,
	SphereBufferGeometry,
	MeshBasicMaterial,
	Object3D,
} from 'three'
import { CollisionType } from '../emun/CollisionType'
import { MessageReceiveType } from '../emun/MessageReceiveType'
import { v4 as uuidv4 } from 'uuid'
import { ParticleColors } from '../emun/ParticleColors'
import { ParticleCamera } from './camera'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { getBoundary } from './boundary'
import { GetWorker } from '../engine/worker'

interface Options {
	scene: Scene
	camera: ParticleCamera
	renderer: WebGLRenderer
	controls: TrackballControls | OrbitControls
}

function isMesh(object: Object3D): object is Mesh {
	return !!(object as Mesh).isMesh
}

const worker = GetWorker()
const boundary = getBoundary()

export default class Environment {
	public raycaster: Raycaster
	public mouse: Vector2
	public scene: Scene
	public camera: ParticleCamera
	public renderer: WebGLRenderer
	// public stats: Stats
	public stepTime: number
	public cameraStart: {
		position: Vector3
		target: Vector3
		up: Vector3
	}
	public controls: TrackballControls | OrbitControls
	public gui: dat.GUI
	private activeParticleUuid: string
	public speedController: dat.GUIController

	private meshMap: Map<string, Mesh>
	private colorMap: Map<string, Color>

	public constructor(options: Options) {
		this.raycaster = new Raycaster()
		this.mouse = new Vector2()
		this.scene = options.scene
		this.camera = options.camera
		this.renderer = options.renderer
		this.controls = options.controls
		this.cameraStart = {
			position: new Vector3(),
			target: new Vector3(),
			up: new Vector3(),
		}
		boundary.redrawBoundary()

		this.renderer.setPixelRatio(
			window.devicePixelRatio ? window.devicePixelRatio : 1,
		)
		// this.renderer.setSize(window.innerWidth, window.innerHeight)
		this.renderer.setClearColor(0x000000, 1)

		this.meshMap = new Map()
		this.colorMap = new Map()
		this.activeParticleUuid = ''
	}

	public objectClick(): void {
		const intersects = this.getIntersects()

		if (intersects.length > 0) {
			const particle = intersects[0].object
			if (isMesh(particle)) {
				const mat = <MeshBasicMaterial>particle.material
				mat.color.set(new Color(0xff0000))
				this.cameraFocus(particle)
			}
		}
	}

	public setDefaultColour(uuid: string): void {
		const mesh = this.meshMap.get(uuid)
		;(mesh.material as MeshBasicMaterial).color.set(this.colorMap.get(uuid))
	}

	private getIntersects(): Intersection[] {
		this.raycaster.setFromCamera(this.mouse, this.camera)
		return this.raycaster.intersectObjects(Array.from(this.meshMap.values()))
	}

	public setPosition(uuid: string, position: Vector3): void {
		this.meshMap.get(uuid).position.copy(position)
	}

	public removeParticle(uuid: string): void {
		this.removeParticleMesh(uuid)
		worker.postMessage({
			type: MessageReceiveType.REMOVE_PARTICLE,
			uuid,
		})
	}

	public removeParticleMesh(uuid: string): void {
		const mesh = this.meshMap.get(uuid)
		if (uuid === this.activeParticleUuid) {
			this.deselectObject()
		}
		this.scene.remove(mesh)
		this.meshMap.delete(uuid)
		this.colorMap.delete(uuid)
	}

	public updatePosition(uuid: string, position: Vector3): void {
		this.meshMap.get(uuid).position.copy(position)
	}

	public updatePositionParts(
		uuid: string,
		x: number,
		y: number,
		z: number,
	): void {
		this.meshMap.get(uuid).position.set(x, y, z)
	}

	public addParticle(
		position: Vector3,
		velocity: Vector3,
		charge: number,
		mass: number,
		radius: number,
	): string {
		const uuid = uuidv4()

		this.createParticleMesh(charge, radius, uuid, position)

		worker.postMessage({
			type: MessageReceiveType.ADD_PARTICLE,
			uuid,
			position,
			velocity,
			charge,
			mass,
			radius,
		})

		return uuid
	}

	public createParticleMesh(
		charge: number,
		radius: number,
		uuid: string,
		position = new Vector3(),
	): void {
		let color: Color
		if (charge > 0) {
			color = new Color(ParticleColors.POSITIVE)
		} else if (charge < 0) {
			color = new Color(ParticleColors.NEGATIVE)
		} else {
			color = new Color(ParticleColors.NEUTRAL)
		}
		const mesh = this.buildObject(radius, color)
		mesh.position.copy(position)
		this.scene.add(mesh)
		this.meshMap.set(uuid, mesh)
		this.colorMap.set(uuid, color)
	}

	private buildObject(radius: number, color: Color): Mesh {
		return new Mesh(
			new SphereBufferGeometry(radius, 15, 15),
			new MeshBasicMaterial({ color, wireframe: true }),
		)
	}

	public onMouseMove(event: MouseEvent): void {
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
		this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
	}

	public cameraFocus(particleMesh: Mesh): void {
		this.deselectObject()
		// particleMesh.add(this.camera)
		this.controls.target.copy(particleMesh.position)
		for (const [uuid, mesh] of this.meshMap) {
			if (mesh.uuid === particleMesh.uuid) {
				this.activeParticleUuid = uuid
				break
			}
		}
	}

	public deselectObject(): void {
		if (this.activeParticleUuid !== '') {
			// const activeParticle = this.meshMap.get(this.activeParticleUuid)
			// activeParticle.remove(this.camera)
			this.setDefaultColour(this.activeParticleUuid)
			this.activeParticleUuid = ''
		}
	}

	public resetCamera(): void {
		this.deselectObject()
		this.camera.position.copy(this.cameraStart.position)
		this.controls.target.copy(this.cameraStart.target)
		this.camera.up.copy(this.cameraStart.up)
		this.controls.update()
	}

	public moveCamera(position = new Vector3(10, 20, 30)): void {
		this.controls.target = position
	}

	public onWindowResize(): void {
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)
	}

	public changeCollisionType(type: CollisionType): void {
		worker.postMessage({
			type: MessageReceiveType.CHANGE_COLLISION_TYPE,
			value: type,
		})
	}

	public updateStepSize(stepSize: number): void {
		worker.postMessage({
			type: MessageReceiveType.UPDATE_STEP_SIZE,
			stepSize,
		})
	}

	public getMesh(uuid: string): Mesh {
		return this.meshMap.get(uuid)
	}
}
