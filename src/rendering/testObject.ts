import {
	Object3D,
	TorusBufferGeometry,
	LineSegments,
	WireframeGeometry,
	LineBasicMaterial,
	MeshPhongMaterial,
	Mesh,
	// FlatShading,
	DoubleSide,
} from 'three'

export default function createTestObject(): Object3D {
	const mesh = new Object3D()

	const geometry = new TorusBufferGeometry(10, 3, 50, 50)

	mesh.add(
		new LineSegments(
			new WireframeGeometry(geometry),
			new LineBasicMaterial({
				color: 0xffffff,
				transparent: true,
				opacity: 0.5,
			}),
		),
	)

	mesh.add(
		new Mesh(
			geometry,
			new MeshPhongMaterial({
				color: 0x156289,
				emissive: 0x072534,
				side: DoubleSide,
				// shading: FlatShading,
			}),
		),
	)

	return mesh
}
