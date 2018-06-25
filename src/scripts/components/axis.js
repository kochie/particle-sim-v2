/**
 * Created by rkoch on 12/23/16.
 */

import {
  Vector3,
  Object3D,
  Geometry,
  LineDashedMaterial,
  LineBasicMaterial,
} from 'three';

export const buildAxes = () => {
  const axes = new Object3D();
  axes.add(
    buildAxis(
      new Vector3(0, 0, 0),
      new Vector3(1000, 0, 0),
      0xff0000,
      false,
    ),
  ); // +X
  axes.add(
    buildAxis(
      new Vector3(0, 0, 0),
      new Vector3(-1000, 0, 0),
      0x800000,
      true,
    ),
  ); // -X
  axes.add(
    buildAxis(
      new Vector3(0, 0, 0),
      new Vector3(0, 1000, 0),
      0x00ff00,
      false,
    ),
  ); // +Y
  axes.add(
    buildAxis(
      new Vector3(0, 0, 0),
      new Vector3(0, -1000, 0),
      0x008000,
      true,
    ),
  ); // -Y
  axes.add(
    buildAxis(
      new Vector3(0, 0, 0),
      new Vector3(0, 0, 1000),
      0x0000ff,
      false,
    ),
  ); // +Z
  axes.add(
    buildAxis(
      new Vector3(0, 0, 0),
      new Vector3(0, 0, -1000),
      0x000080,
      true,
    ),
  ); // -Z
  return axes;
};

const buildAxis = (src, dst, colorHex, dashed) => {
  const geom = new Geometry();
  let mat;

  if (dashed) {
    mat = new LineDashedMaterial({
      linewidth: 1,
      color: colorHex,
      dashSize: 5,
      gapSize: 5,
    });
  } else {
    mat = new LineBasicMaterial({ linewidth: 1, color: colorHex });
  }

  geom.vertices.push(src.clone());
  geom.vertices.push(dst.clone());

  return new Line(geom, mat);
};
