import {
	LineDashedMaterial,
	LineBasicMaterial,
	Line,
	BufferGeometry,
	Float32BufferAttribute,
	Group,
} from 'three'

const createLine = (
	src: [number, number, number],
	dst: [number, number, number],
	color: number,
	dashed: boolean = false,
): Line => {
	const geometry = new BufferGeometry()
	let mat: LineBasicMaterial

	if (dashed) {
		mat = new LineDashedMaterial({ color, dashSize: 10, gapSize: 5 })
	} else {
		mat = new LineBasicMaterial({ color })
	}

	geometry.setAttribute(
		'position',
		new Float32BufferAttribute([...src, ...dst], 3),
	)

	const line = new Line(geometry, mat)
	line.computeLineDistances()
	return line
}

export default () => {
	const axes = new Group()
	axes.add(createLine([0, 0, 0], [500, 0, 0], 0xff0000))
	axes.add(createLine([0, 0, 0], [-500, 0, 0], 0x800000, true))
	axes.add(createLine([0, 0, 0], [0, 500, 0], 0x00ff00))
	axes.add(createLine([0, 0, 0], [0, -500, 0], 0x008000, true))
	axes.add(createLine([0, 0, 0], [0, 0, 500], 0x0000ff))
	axes.add(createLine([0, 0, 0], [0, 0, -500], 0x000080, true))
	return axes
}
