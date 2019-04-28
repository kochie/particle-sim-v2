import {
	Vector3,
	Object3D,
	Geometry,
	LineDashedMaterial,
	LineBasicMaterial,
	Line,
	Color,
} from 'three'

const buildAxis = (
	src: Vector3,
	dst: Vector3,
	colorHex: Color,
	dashed: boolean,
): Line => {
	const geom: Geometry = new Geometry()
	let mat: LineBasicMaterial

	if (dashed) {
		mat = new LineDashedMaterial({
			linewidth: 1,
			color: colorHex,
			dashSize: 5,
			gapSize: 5,
		})
	} else {
		mat = new LineBasicMaterial({ linewidth: 1, color: colorHex })
	}

	geom.vertices.push(src.clone())
	geom.vertices.push(dst.clone())

	return new Line(geom, mat)
}

export default function buildAxes(): Object3D {
	const axes = new Object3D()
	axes.add(
		buildAxis(
			new Vector3(0, 0, 0),
			new Vector3(1000, 0, 0),
			new Color(0xff0000),
			false,
		),
	)
	axes.add(
		buildAxis(
			new Vector3(0, 0, 0),
			new Vector3(-1000, 0, 0),
			new Color(0x800000),
			true,
		),
	)
	axes.add(
		buildAxis(
			new Vector3(0, 0, 0),
			new Vector3(0, 1000, 0),
			new Color(0x00ff00),
			false,
		),
	)
	axes.add(
		buildAxis(
			new Vector3(0, 0, 0),
			new Vector3(0, -1000, 0),
			new Color(0x008000),
			true,
		),
	)
	axes.add(
		buildAxis(
			new Vector3(0, 0, 0),
			new Vector3(0, 0, 1000),
			new Color(0x0000ff),
			false,
		),
	)
	axes.add(
		buildAxis(
			new Vector3(0, 0, 0),
			new Vector3(0, 0, -1000),
			new Color(0x000080),
			true,
		),
	)
	return axes
}
