import { Point } from "../types";
import { Transform2D } from "./Transform2D";

/**
 * a.k.a. LocalTRS
 */
export class Pose2D {
  constructor(
    public position: Point = Transform2D.P(0, 0),
    public rotationRad: number = 0,
    public scale: Point = Transform2D.P(1, 1),
    public pivot: Point | null = null // in LOCAL coordinates
  ) {

  }

  /* Relative changes (drag-friendly) */
  translateBy(dx: number, dy: number) { this.position = Transform2D.P(this.position.x + dx, this.position.y + dy); }
  rotateBy(dRad: number) { this.rotationRad += dRad; }
  scaleBy(fx: number, fy: number, parentPivot?: Point) {
    // console.log("parentPivot=" ,parentPivot);
    if(parentPivot) {
      const transform = Transform2D.T(parentPivot.x, parentPivot.y).multiplyRight(Transform2D.S(fx, fy)).multiplyRight(Transform2D.T(-parentPivot.x, -parentPivot.y))
      this.position = transform.applyToPoint(this.position);
      this.scale = Transform2D.P(this.scale.x * fx, this.scale.y * fy);
    }else {
      this.scale = Transform2D.P(this.scale.x * fx, this.scale.y * fy);
    }
  }

  /* /Relative changes*/

  /**
   * TRS: M = T * R * S (taking into account pivot, if given)
   * @returns M
   */
  public toMatrix(): Transform2D {
    const T = Transform2D.T(this.position.x, this.position.y);
    const S0 = Transform2D.S(this.scale.x, this.scale.y);
    const R0 = Transform2D.R(this.rotationRad);

    //INFO: How it works:
    // - switch to the pivot coordinate system
    // - apply scale
    // - return to the object's local coordinate system
    const S = this.pivot
      ? Transform2D.T(this.pivot.x, this.pivot.y).multiplyRight(S0)
          .multiplyRight(Transform2D.T(-this.pivot.x, -this.pivot.y))
      : S0;

    const R = this.pivot
      ? Transform2D.T(this.pivot.x, this.pivot.y).multiplyRight(R0)
          .multiplyRight(Transform2D.T(-this.pivot.x, -this.pivot.y))
      : R0;

    return T.multiplyRight(R).multiplyRight(S);
  }
  public clone() {
    const position = Transform2D.P(this.position.x, this.position.y);
    const scale = Transform2D.P(this.scale.x, this.scale.y);
    const pivot = this.pivot ? Transform2D.P(this.pivot.x, this.pivot.y) : null;
    return new Pose2D(position, this.rotationRad, scale, pivot);
  }
}
