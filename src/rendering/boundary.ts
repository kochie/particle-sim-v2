import { BoundaryType } from '../emun/BoundaryType'
import {
	Mesh,
	BoxBufferGeometry,
	MeshBasicMaterial,
	Scene,
	GridHelper,
} from 'three'
import { GetWorker } from '../engine/worker'
import { MessageReceiveType } from '../emun/MessageReceiveType'
import { getScene } from './scene'

const worker = GetWorker()
const scene = getScene()

export class Boundary {
	private type: BoundaryType
	private size: number
	private mesh: Mesh
	private visible: boolean
	private grid: GridHelper

	constructor() {
		this.type = BoundaryType.CLOSED
		this.size = 50
		this.mesh = null
		this.grid = null
		this.visible = true
	}

	public toggleBoundaryVisibility(): void {
		this.visible = !this.visible
		this.redrawBoundary()
	}

	public drawBoundary(): void {
		if (this.type === BoundaryType.NONE || !this.visible) {
			return
		}
		const size = this.size * 2
		const boundaryGeometry = new BoxBufferGeometry(size, size, size)
		const material = new MeshBasicMaterial({
			color: 0x0ffff0,
			wireframe: true,
		})
		this.mesh = new Mesh(boundaryGeometry, material)
		this.grid = new GridHelper(size, 10)
		scene.add(this.grid)
		scene.add(this.mesh)
	}

	public changeBoundaryType(type: BoundaryType): void {
		this.type = type
		worker.postMessage({
			type: MessageReceiveType.UPDATE_BOUNDARY_TYPE,
			value: type,
		})
		this.redrawBoundary()
	}

	public changeBoundarySize(size: number): void {
		this.size = size
		worker.postMessage({
			type: MessageReceiveType.UPDATE_BOUNDARY_SIZE,
			value: size,
		})
		this.redrawBoundary()
	}

	public redrawBoundary(): void {
		scene.remove(this.mesh)
		scene.remove(this.grid)
		this.drawBoundary()
	}

	public getBoundarySize(): number {
		return this.size
	}
}

const boundary = new Boundary()

export const getBoundary = () => {
	return boundary
}
