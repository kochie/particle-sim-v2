import { Vector3 } from 'three'

export enum MessageReceiveType {
	UPDATE_GRAVITY = 'UPDATE_GRAVITY',
	UPDATE_ELECTO = 'UPDATE_ELECTRO',
	UPDATE_BOUNDARY_SIZE = 'UPDATE_BOUNDARY_SIZE',
	UPDATE_BOUNDARY_TYPE = 'UPDATE_BOUNDARY_TYPE',
	ADD_PARTICLE = 'ADD_PARTICLE',
	REMOVE_PARTICLE = 'REMOVE_PARTICLE',
	UPDATE_STEP_SIZE = 'UPDATE_STEP_SIZE',
	CHANGE_COLLISION_TYPE = 'CHANGE_COLLISION_TYPE',
}

export enum MessageSendType {
	ADD_PARTICLE = 'ADD_PARTICLE',
	REMOVE_PARTICLE = 'REMOVE_PARTICLE',
	UPDATE_POSITIONS = 'UPDATE_POSITIONS',
}

export enum ParticleType {
	PROTON = 'PROTON',
	NEUTRON = 'NEUTRON',
	ELECTRON = 'ELECTRON',
	RANDOM = 'RANDOM',
}

export enum BoundaryType {
	CLOSED = 'CLOSED',
	TORUS = 'TORUS',
	DELETE = 'DELETE',
	NONE = 'NONE',
}

export enum KinematicMethod {
	EULER = 'EULER',
	RK4 = 'RK4',
}

export enum CollisionType {
	BOUNCE = 'BOUNCE',
	ABSORB = 'ABSORB',
	NONE = 'NONE',
}

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
