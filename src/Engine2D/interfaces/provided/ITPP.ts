import { Point, Vector } from "@foundation/Geometry";

/**
 * Transform Projection Provider
 */
export interface ITPP {
  worldToCanvas(point: Point): Point;
  worldToCanvasVector(vector: Vector): Vector;
  windowToCanvas(point: Point): Point;
  windowToWorld(point: Point): Point;
  windowToWorldVector(vector: Vector): Vector;

  /* world container */worldToWorldContainer(point: Point): Point;
  worldToWorldContainerVector(vector: Vector): Vector;
  /* /world container */
  canvasToViewport(point: Point): Point;
}
