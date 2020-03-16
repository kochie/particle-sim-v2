import {
	Vector3,
	TorusGeometry,
	MeshBasicMaterial,
	Mesh,
	Object3D,
	Color,
} from 'three'
import Environment from './environment'

export class RingGroup {
	public meshList: Mesh[]
	public rings: Object3D[]
	public sumForce: number[]
	public constructor() {
		this.meshList = []
		this.rings = []
		this.sumForce = []
	}

	public addObject(object: Object3D): void {
		this.rings.push(object)
		this.meshList.push(object.mesh)
		if (this.rings.length > 1) {
			this.sumForce.push(0)
		}
	}
}

export class Ring {
	public charge: number
	public mesh: Object3D
	public position: Vector3
	public color: Color
	public constructor(env: Environment, position = new Vector3()) {
		this.charge = 1
		this.mesh = new Object3D()
		this.position = position
		this.color = new Color(0xffff00)

		env.scene.add(this.mesh)
		env.ringGroup.addObject()
	}

	public buildObject(): void {
		const geometry = new TorusGeometry(10, 3, 16, 100)
		this.mesh = new Mesh(
			geometry,
			new MeshBasicMaterial({ color: this.color, wireframe: true }),
		)
		this.mesh.particle = this
		this.setPosition()
	}

	public setPosition(): void {
		this.mesh.position.set(this.position.x, this.position.y, this.position.z)
	}
}
