import { Vector3 } from 'three';

type FieldFunction = (x: number, y: number, z: number) => number

export default class Field {
  private fnX: FieldFunction
  private fnY: FieldFunction
  private fnZ: FieldFunction
  
  public constructor(
    fnX: FieldFunction = () => 0,
    fnY: FieldFunction = () => 0,
    fnZ: FieldFunction = () => 0,
  ) {
    this.fnX = fnX;
    this.fnY = fnY;
    this.fnZ = fnZ;
  }

  public getValue(position: Vector3): Vector3 {
    return new Vector3(
      this.fnX(position.x, position.y, position.z),
      this.fnY(position.x, position.y, position.z),
      this.fnZ(position.x, position.y, position.z),
    );
  }
}
