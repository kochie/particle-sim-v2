const worker = new Worker('./physics.worker.ts')

export const GetWorker = () => {
	return worker
}
