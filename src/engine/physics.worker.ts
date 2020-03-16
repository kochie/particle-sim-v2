import { World } from './world'
import { Message } from '../emun/Message'
import { MessageReceiveType } from '../emun/MessageReceiveType'
import { Particle } from '../rendering/particle'
import { Vector3 } from 'three'

const world = new World()

onmessage = function(e: MessageEvent): void {
	const message = e.data as Message

	console.log(message)
	switch (message.type) {
		case MessageReceiveType.UPDATE_GRAVITY: {
			console.log(message.value)
			world.setGravity(message.value)
			break
		}
		case MessageReceiveType.UPDATE_ELECTO: {
			world.setElectro(message.value)
			break
		}
		case MessageReceiveType.UPDATE_STEP_SIZE: {
			world.setStepSize(message.stepSize)
			break
		}
		case MessageReceiveType.UPDATE_BOUNDARY_SIZE: {
			world.setBoundarySize(message.value)
			break
		}
		case MessageReceiveType.UPDATE_BOUNDARY_TYPE: {
			world.setBoundaryType(message.value)
			break
		}
		case MessageReceiveType.CHANGE_COLLISION_TYPE: {
			world.setCollisionType(message.value)
			break
		}
		case MessageReceiveType.ADD_PARTICLE: {
			const position = new Vector3(
				message.position.x,
				message.position.y,
				message.position.z,
			)
			const velocity = new Vector3(
				message.velocity.x,
				message.velocity.y,
				message.velocity.z,
			)
			const particle = new Particle(
				message.uuid,
				message.charge,
				position,
				velocity,
				message.radius,
				message.mass,
			)
			world.addParticle(particle)
			break
		}
		case MessageReceiveType.REMOVE_PARTICLE: {
			world.removeParticle(message.uuid)
			break
		}
		default: {
			break
		}
	}
}

setInterval((): void => world.update(), 0)
