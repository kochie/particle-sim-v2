import { Vector3 } from 'three'
// import Stats from 'stats.js'
// import * as dat from 'dat.gui'

// import PhyiscsWorkerBuiler from './physics.worker'
// import { positionCamera } from './camera'
// import placeParticle from './gui'
import Environment from './environment'
// import TrackballControls from './TrackballControls'
// import buildAxes from './axis'
import { SentMessage } from '../emun/SentMessage'
// import { CollisionType } from '../emun/CollisionType'
// import { BoundaryType } from '../emun/BoundaryType'
// import { ParticleType } from '../emun/ParticleType'
// import { MessageReceiveType } from '../emun/MessageReceiveType'
import { MessageSendType } from '../emun/MessageSendType'
import { GetWorker } from '../engine/worker'
// import { SendHandle } from 'child_process'
// import { threeBody, pattern } from './patterns'

const worker = GetWorker()

export default function init(env: Environment) {
	// let context = canvasElement.getContext('webgl2') as WebGL2RenderingContext
	// if (context === null) {
	// 	context = canvasElement.getContext('webgl')
	// }

	// const physicsWorker = new Worker('./physics.worker')

	// const env = new Environment({
	// 	scene: new Scene(),
	// 	camera: new PerspectiveCamera(
	// 		75,
	// 		window.innerWidth / window.innerHeight,
	// 		0.1,
	// 		10000,
	// 	),
	// 	renderer: new WebGLRenderer({
	// 		antialias: true,
	// 		context: context,
	// 		canvas: canvasElement,
	// 	}),
	// 	// stats: new Stats(),
	// 	physicsWorker,
	// })

	// env.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
	// document.body.appendChild(env.stats.dom)

	// env.controls = new TrackballControls(env.camera, env.renderer.domElement)
	// env.controls.rotateSpeed = 8

	// env.controls.enableDamping = true;
	// env.controls.dampingFactor = 0.1;
	// env.controls.enableZoom = false;

	// positionCamera(env, new Vector3(20, 20, 20))

	// env.cameraStart.position = env.camera.position.clone()
	// env.cameraStart.target = env.controls.target.clone()
	// env.cameraStart.up = env.camera.up.clone()

	window.addEventListener(
		'mousemove',
		(event: MouseEvent): void => {
			env.onMouseMove(event)
		},
		false,
	)
	document.addEventListener(
		'dblclick',
		(): void => {
			env.objectClick()
		},
		false,
	)

	worker.onmessage = function(e: MessageEvent): void {
		const message = <SentMessage>e.data

		switch (message.type) {
			case MessageSendType.UPDATE_POSITIONS: {
				message.uuid.forEach((uuid, i): void => {
					env.updatePositionParts(
						uuid,
						message.positionsX[i],
						message.positionsY[i],
						message.positionsZ[i],
					)
				})
				break
			}
			case MessageSendType.REMOVE_PARTICLE: {
				env.removeParticleMesh(message.uuid)
				break
			}
			case MessageSendType.ADD_PARTICLE: {
				const position = new Vector3(
					message.position.x,
					message.position.y,
					message.position.z,
				)
				env.createParticleMesh(
					message.charge,
					message.radius,
					message.uuid,
					position,
				)
				break
			}
			default: {
				break
			}
		}
	}

	// window.addEventListener(
	// 	'resize',
	// 	(): void => {
	// 		env.onWindowResize()
	// 	},
	// 	false,
	// )

	// const axes = buildAxes()
	// env.scene.add(axes)
}
