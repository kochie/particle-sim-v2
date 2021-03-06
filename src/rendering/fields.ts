import { Vector3 } from 'three'

type FieldFunction = (x: number, y: number, z: number, t: number) => number

export default class Field {
	private fnX: FieldFunction
	private fnY: FieldFunction
	private fnZ: FieldFunction

	public constructor(
		fnX: FieldFunction = (): number => 0,
		fnY: FieldFunction = (): number => 0,
		fnZ: FieldFunction = (): number => 0,
	) {
		this.fnX = fnX
		this.fnY = fnY
		this.fnZ = fnZ
	}

	public getValue(position: Vector3, time = 0): Vector3 {
		return new Vector3(
			this.fnX(position.x, position.y, position.z, time),
			this.fnY(position.x, position.y, position.z, time),
			this.fnZ(position.x, position.y, position.z, time),
		)
	}
}
