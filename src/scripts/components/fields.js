/**
 * Created by rkoch on 1/2/17.
 */

import { Vector3 } from 'three';

export default class Field {
  constructor(
    fnX = () => 0,
    fnY = () => 0,
    fnZ = () => 0,
  ) {
    this.fn_x = fnX;
    this.fn_y = fnY;
    this.fn_z = fnZ;
  }

  getValue(position) {
    return new Vector3(
      this.fn_x(position.x, position.y, position.z),
      this.fn_y(position.x, position.y, position.z),
      this.fn_z(position.x, position.y, position.z),
    );
  }
}
