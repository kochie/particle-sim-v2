/**
 * Created by rkoch on 12/23/16.
 */

import {
  Object3D,
  TorusBufferGeometry,
  LineSegments,
  WireframeGeometry,
  LineBasicMaterial,
  MeshPhongMaterial,
} from 'three';

export function createTestObject() {
  const mesh = new Object3D();

  const geometry = new TorusBufferGeometry(10, 3, 50, 50);

  mesh.add(
    new LineSegments(
      new WireframeGeometry(geometry),
      new LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
      }),
    ),
  );

  mesh.add(
    new Mesh(
      geometry,
      new MeshPhongMaterial({
        color: 0x156289,
        emissive: 0x072534,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading,
      }),
    ),
  );

  return mesh;
}
