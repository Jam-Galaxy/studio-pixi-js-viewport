import { Point, Vector } from "@foundation/Geometry";
import { CanvasClientMapper } from "./CanvasClientMapper";
import { Viewport } from "./Viewport";
import { TransformProjection } from "./TransformProjection";

/**
 * The purpose of the class is to simplify transitions between spaces. Engine2D provides it with matrices, and TransformProjection handles the actual multiplication of the matrices. 
 */ 
export class TransformProjectionProvider {
  constructor(private canvasClientMapper: CanvasClientMapper, private viewport: Viewport) {

  }
  public worldToCanvas(point: Point): Point {
    return TransformProjection.worldToCanvas(point, this.viewport.viewportToCanvas, this.viewport.worldToViewport);
  }
  public worldToCanvasVector(vector: Vector): Vector {
    return TransformProjection.worldToCanvasVector(vector, this.viewport.viewportToCanvas, this.viewport.worldToViewport);
  }
  public windowToCanvas(point: Point): Point {
    return TransformProjection.windowToCanvas(point, this.canvasClientMapper.windowToCanvas);
  }
  public windowToWorld(point: Point): Point {
    // console.log(this.viewport.viewportToWorld);
    return TransformProjection.windowToWorld(point, this.viewport.viewportToWorld, this.viewport.canvasToViewport, this.canvasClientMapper.windowToCanvas);
  }
  public windowToWorldVector(vector: Vector) {
    return TransformProjection.windowToWorldVector(vector, this.viewport.viewportToWorld, this.viewport.canvasToViewport, this.canvasClientMapper.windowToCanvas);
  }

  /* world container */
  /**
   * 
   * @param point world units
   * @returns pixels of world container
   */
  public worldToWorldContainer(point: Point): Point {
    return TransformProjection.worldToWorldContainer(point, this.viewport.viewportToCanvas);
  } 
  public worldToWorldContainerVector(vector: Vector): Vector {
    return TransformProjection.worldToWorldContainerVector(vector, this.viewport.viewportToCanvas);
  }
  /* /world container */

  public canvasToViewport(point: Point): Point {
    return TransformProjection.canvasToViewport(point, this.viewport.canvasToViewport);
  }
}