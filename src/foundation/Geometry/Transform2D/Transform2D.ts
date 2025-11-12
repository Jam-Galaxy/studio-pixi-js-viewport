//@ts-expect-error: no type declaration
import MatrixJs from "matrix-js";

import { Point, TransformationMatrix, Vector } from "../types";

/**
 * immutable implementation of Transform2D. Use it with classes Pose2D(foundation layer) and TransformProjection(ui layer)
 * order of multiplication ??
 */
export class Transform2D {
  /* value fabrics */
  public static P(x: number, y: number): Point {
    return {x, y, __brand: 'Point' as const};
  }
  public static V(x: number, y: number): Vector {
    return {x, y, __brand: 'Vector' as const};
  }
  /* /value fabrics */

  /* Transform2D fabrics */
  public static identity() { return new Transform2D(1,0,0,1,0,0); }

  static T(dx:number, dy:number) { return new Transform2D(1,0,0,1,dx,dy); }
  static S(sx:number, sy:number) { return new Transform2D(sx,0,0,sy,0,0); }
  static R(rad:number) {
    const co=Math.cos(rad), si=Math.sin(rad);
    return new Transform2D(co,si,-si,co,0,0);
  }

  /**
   * from Translate Rotate Scale
   * @param opts pivot - the center of scale and rotation
   */
  static fromTRS(
    t:Point = Transform2D.P(0,0),
    r:number = 0,
    s:Point = Transform2D.P(1,1),
    opts?: { pivot?: Point, order?: 'T*R*S'|'T*S*R'|'R*T*S'|'S*R*T' }
  ): Transform2D {
    const order = opts?.order ?? 'T*R*S';
    const T = Transform2D.T(t.x, t.y);
    const R = opts?.pivot
      ? Transform2D.T(opts.pivot.x,opts.pivot.y)
          .multiplyRight(Transform2D.R(r))
          .multiplyRight(Transform2D.T(-opts.pivot.x,-opts.pivot.y))
      : Transform2D.R(r);
    const S = opts?.pivot
      ? Transform2D.T(opts.pivot.x,opts.pivot.y)
          .multiplyRight(Transform2D.S(s.x,s.y))
          .multiplyRight(Transform2D.T(-opts.pivot.x,-opts.pivot.y))
      : Transform2D.S(s.x,s.y);

    switch (order) {
      case 'T*R*S': return T.multiplyRight(R).multiplyRight(S);
      case 'T*S*R': return T.multiplyRight(S).multiplyRight(R);
      case 'R*T*S': return R.multiplyRight(T).multiplyRight(S);
      case 'S*R*T': return S.multiplyRight(R).multiplyRight(T);
    }
  }
  static fromTransformationMatrix(transformationMatrix: TransformationMatrix): Transform2D {
    return new Transform2D(
      transformationMatrix[0][0], transformationMatrix[0][1],
      transformationMatrix[1][0], transformationMatrix[1][1],
      transformationMatrix[0][2], transformationMatrix[1][2]
    );
  }
  /* /Transform2D fabrics */

  /**
   * ```
   *  |a  b tx|
   *  |c  d ty|
   *  |0  0  1|
   * ```
   */
  constructor(
    public readonly a:number, public readonly b:number,
    public readonly c:number, public readonly d:number,
    public readonly tx:number, public readonly ty:number
  ) {}

  public toTranformationMatrix() {
    return [
      [this.a, this.b, this.tx],
      [this.c, this.d, this.ty],
      [0, 0, 1],
    ]
  }
  /**
   * 
   * @param o 
   * @returns this * `o`
   */
  public multiplyRight(o: Transform2D): Transform2D {
    const result =  MatrixJs(this.toTranformationMatrix()).prod(MatrixJs(o.toTranformationMatrix()));
    return Transform2D.fromTransformationMatrix(result);
  }
  public invert(): Transform2D {
    const result = MatrixJs(this.toTranformationMatrix()).inv();
    return Transform2D.fromTransformationMatrix(result);
  }

  public applyToPoint(p: Point): Point {
    return Transform2D.P(this.a*p.x + this.b*p.y + this.tx, this.c*p.x + this.d*p.y + this.ty);
  }
  public applyToVector(v: Vector): Vector {
    return Transform2D.V(this.a*v.x + this.b*v.y, this.c*v.x + this.d*v.y);
  }
  public applyInverseToPoint(p: Point): Point {
    return this.invert().applyToPoint(p);
  }
  public applyInverseToVector(v: Vector): Vector {
    return this.invert().applyToVector(v);
  }
}
