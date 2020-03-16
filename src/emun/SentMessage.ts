import { Vector3 } from 'three'
import { MessageSendType } from './MessageSendType'
export type SentMessage =
	| {
			type: MessageSendType.ADD_PARTICLE
			uuid: string
			position: Vector3
			velocity: Vector3
			charge: number
			mass: number
			radius: number
	  }
	| {
			type: MessageSendType.REMOVE_PARTICLE
			uuid: string
	  }
	| {
			type: MessageSendType.UPDATE_POSITIONS
			positionsX: Float64Array
			positionsY: Float64Array
			positionsZ: Float64Array
			uuid: [string]
	  }
