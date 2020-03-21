import { WebGLRenderer } from "three"
// import { TrackballControls } from "three/examples/jsm/controls/TrackballControls"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import Stats from 'stats.js'
import { ParticleCamera } from "./rendering/camera"

import axis from "./rendering/axis"
import { getScene } from "./rendering/scene"
import init from "./rendering/init"
import Environment from "./rendering/environment"
import { setupSidebar } from "./rendering/sidebar"
import { GetWorker } from "./engine/worker"

const canvasElement = <HTMLCanvasElement>document.getElementById("canvas")
const webgl2Context = canvasElement.getContext('webgl')

const renderer = new WebGLRenderer({
    antialias: true,
    context: webgl2Context,
    canvas: canvasElement
})

renderer.setSize(window.innerWidth, window.innerHeight)

const camera = new ParticleCamera()
const controls = new OrbitControls(camera, canvasElement)
const scene = getScene()

controls.staticMoving = true
scene.add(axis())

const stats = new Stats()
document.body.appendChild(stats.dom)

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

// const physicsWorker = new Worker("./engine/physics.worker.ts")

const update = () => {
    window.requestAnimationFrame(update)

    renderer.render(scene, camera);
    controls.update()
    stats.update()
}

const env = new Environment({
	scene,
	camera,
	renderer,
	controls
})

const worker = GetWorker()
const sharedBuffer = new SharedArrayBuffer(16)
const uint8 = new Uint8Array(sharedBuffer);
worker.postMessage({sharedBuffer})

window.onload = () => {
    init(env)
    setupSidebar(env)
    window.requestAnimationFrame(update)
}
