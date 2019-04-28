import {
	Raycaster,
	Vector2,
	Vector3,
	Scene,
	WebGLRenderer,
	PerspectiveCamera,
	Mesh,
	Intersection,
	Color,
	SphereBufferGeometry,
	MeshBasicMaterial,
	Object3D,
	BoxBufferGeometry,
} from 'three'
import TrackballControls from './TrackballControls'
import { FizzyText } from './init'
import { MessageReceiveType, BoundaryType, CollisionType } from './messages'
import { v4 as uuidv4 } from 'uuid'

interface Options {
	scene: Scene
	camera: PerspectiveCamera
	renderer: WebGLRenderer
	stats: Stats
	physicsWorker: Worker
}

function isMesh(object: Object3D): object is Mesh {
	return !!(object as Mesh).isMesh
}

export enum ParticleColors {
	POSITIVE = 0x0000ff,
	NEGATIVE = 0x00ff00,
	NEUTRAL = 0xffa500,
}

export default class Environment {
	public raycaster: Raycaster
	public mouse: Vector2
	public scene: Scene
	public camera: PerspectiveCamera
	public renderer: WebGLRenderer
	public stats: Stats
	public stepTime: number
	public cameraStart: {
		position: Vector3
		target: Vector3
		up: Vector3
	}
	public controls: TrackballControls
	public text: FizzyText
	public gui: dat.GUI
	private activeParticleUuid: string
	public speedController: dat.GUIController
	public boundary: {
		type: BoundaryType
		size: number
		mesh: Mesh
		visible: boolean
	}

	private meshMap: Map<string, Mesh>
	private colorMap: Map<string, Color>
	private physicsWorker: Worker

	public constructor(options: Options) {
		this.raycaster = new Raycaster()
		this.mouse = new Vector2()
		this.scene = options.scene
		this.camera = options.camera
		this.renderer = options.renderer
		this.stats = options.stats
		this.cameraStart = {
			position: new Vector3(),
			target: new Vector3(),
			up: new Vector3(),
		}
		this.boundary = {
			type: BoundaryType.CLOSED,
			size: 50,
			mesh: null,
			visible: true,
		}
		this.drawBoundary()

		this.renderer.setPixelRatio(
			window.devicePixelRatio ? window.devicePixelRatio : 1,
		)
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		this.renderer.setClearColor(0x000000, 1)

		this.meshMap = new Map()
		this.colorMap = new Map()
		this.activeParticleUuid = ''
		this.physicsWorker = options.physicsWorker
	}

	public objectClick(): void {
		const intersects = this.getIntersects()

		if (intersects.length > 0) {
			const particle = intersects[0].object
			if (isMesh(particle)) {
				;(particle.material as MeshBasicMaterial).color.set(new Color(0xff0000))
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
		this.physicsWorker.postMessage({
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

		this.physicsWorker.postMessage({
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
		particleMesh.add(this.camera)
		this.controls.target.copy(particleMesh.position)
		for (const [uuid, mesh] of this.meshMap) {
			if (mesh.uuid === particleMesh.uuid) {
				this.activeParticleUuid = uuid
				break
			}
		}
	}

	private deselectObject(): void {
		if (this.activeParticleUuid !== '') {
			const activeParticle = this.meshMap.get(this.activeParticleUuid)
			activeParticle.remove(this.camera)
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

	public toggleBoundaryVisibility(): void {
		this.boundary.visible = !this.boundary.visible
		this.redrawBoundary()
	}

	public drawBoundary(): void {
		if (this.boundary.type === BoundaryType.NONE || !this.boundary.visible) {
			return
		}
		const size = this.boundary.size * 2
		const boundaryGeometry = new BoxBufferGeometry(size, size, size)
		const material = new MeshBasicMaterial({
			color: 0x0ffff0,
			wireframe: true,
		})
		this.boundary.mesh = new Mesh(boundaryGeometry, material)
		this.scene.add(this.boundary.mesh)
	}

	public changeBoundaryType(type: BoundaryType): void {
		this.boundary.type = type
		this.physicsWorker.postMessage({
			type: MessageReceiveType.UPDATE_BOUNDARY_TYPE,
			value: type,
		})
		this.redrawBoundary()
	}

	public changeBoundarySize(size: number): void {
		this.boundary.size = size
		this.physicsWorker.postMessage({
			type: MessageReceiveType.UPDATE_BOUNDARY_SIZE,
			value: size,
		})
		this.redrawBoundary()
	}

	public redrawBoundary(): void {
		this.scene.remove(this.boundary.mesh)
		this.drawBoundary()
	}

	public changeCollisionType(type: CollisionType): void {
		this.physicsWorker.postMessage({
			type: MessageReceiveType.CHANGE_COLLISION_TYPE,
			value: type,
		})
	}

	public updateStepSize(stepSize: number): void {
		this.physicsWorker.postMessage({
			type: MessageReceiveType.UPDATE_STEP_SIZE,
			stepSize,
		})
	}

	public getBoundarySize(): number {
		return this.boundary.size
	}

	public getMesh(uuid: string): Mesh {
		return this.meshMap.get(uuid)
	}
}
