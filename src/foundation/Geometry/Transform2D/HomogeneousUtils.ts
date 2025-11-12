import type { Point, HomogeneousPoint } from "../types";
import { Transform2D } from "./Transform2D";

export const HOMOGENEOUS_Z = 1;
export const MATRIX_DIMENSION = 3;
export class HomogeneousUtils {
  public static pointToHomogeneous(point: Point): HomogeneousPoint {
    return [point.x, point.y, HOMOGENEOUS_Z];
  }
  public static homogeneousToPoint(homogeneousPoint: HomogeneousPoint): Point {
    return Transform2D.P(homogeneousPoint[0], homogeneousPoint[1]);
  }
}
