import { Vector3 } from 'three'
import { MessageReceiveType } from './MessageReceiveType'
import { BoundaryType } from './BoundaryType'
import { CollisionType } from './CollisionType'
export type Message =
	| {
			type: MessageReceiveType.UPDATE_GRAVITY
			value: number
	  }
	| {
			type: MessageReceiveType.UPDATE_ELECTO
			value: number
	  }
	| {
			type: MessageReceiveType.UPDATE_STEP_SIZE
			stepSize: number
	  }
	| {
			type: MessageReceiveType.UPDATE_BOUNDARY_SIZE
			value: number
	  }
	| {
			type: MessageReceiveType.UPDATE_BOUNDARY_TYPE
			value: BoundaryType
	  }
	| {
			type: MessageReceiveType.CHANGE_COLLISION_TYPE
			value: CollisionType
	  }
	| {
			type: MessageReceiveType.ADD_PARTICLE
			uuid: string
			position: Vector3
			velocity: Vector3
			charge: number
			mass: number
			radius: number
	  }
	| {
			type: MessageReceiveType.REMOVE_PARTICLE
			uuid: string
	  }
