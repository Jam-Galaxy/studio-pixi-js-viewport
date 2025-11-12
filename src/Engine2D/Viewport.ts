import { Point, Pose2D, Rect, Transform2D, Vector } from "@foundation/Geometry";
import { clamp } from "@foundation/Geometry/GeometryFunctions";
import { configuration } from "./data/configuration";
import { TransformProjection } from "./TransformProjection";

export class Viewport {
  /* use position and rotation only. Do not use scale. scale always 1 1. Use zoom and ppu instead. */
  public pose: Pose2D;

  /* pixels per unit. Number of pixels in one world unit */
  public ppu: Vector;

  /* dimensions of viewport in view units */
  public viewWidthPx: number;
  public viewHeightPx: number;

  /* dimensions of viewport in world units */
  public get worldWidth() {
    const worldWidth = this.viewWidthPx / this.ppu.x;
    return worldWidth;
  }
  public get worldHeight() {
    const worldHeight = this.viewHeightPx / this.ppu.y;
    return worldHeight;
  }
  private worldConstraints: Rect;

  /**
   * get viewport area as rect in world units
   */
  public get worldRect(): Rect {
    const rect = {
      x: this.pose.position.x,
      y: this.pose.position.y,
      w: this.worldWidth,
      h: this.worldHeight,
    }
    return rect;
  }

  get canvasToViewport(): Transform2D {
    return this.viewportToCanvas.invert();
  }
  /* viewport(local world) -> canvas(px) */
  get viewportToCanvas(): Transform2D {
    return Transform2D.S(this.ppu.x, this.ppu.y);
  }

  /* viewport(local world) -> world(global world) */
  get viewportToWorld(): Transform2D {
    return this.pose.toMatrix();
  }
  get worldToViewport(): Transform2D {
    return this.viewportToWorld.invert();
  }

  constructor() {
    this.viewWidthPx = 300;
    this.viewHeightPx = 500;
    this.worldConstraints = structuredClone(configuration.worldConstraints);
    this.pose = new Pose2D();
    this.ppu = Transform2D.V(configuration.defaultPPU.x, configuration.defaultPPU.y);
  }
  /**
   * 
   * @param vector in world units
   */
  public translateBy(vector: Vector) {
    this.pose.translateBy(vector.x, vector.y);
    
    const heightWorld = TransformProjection.canvasToViewport(Transform2D.P(0, configuration.styles.primaryRuler.height), this.canvasToViewport).y;

    const clampedX = clamp(this.pose.position.x, this.worldConstraints.x, Number.isFinite(this.worldConstraints.w) ? (this.worldConstraints.x + this.worldConstraints.w) : this.worldConstraints.w);
    const clampedY = clamp(this.pose.position.y, this.worldConstraints.y - heightWorld, Number.isFinite(this.worldConstraints.h) ? (this.worldConstraints.y + this.worldConstraints.h) : this.worldConstraints.h);
    this.pose.position.x = clampedX;
    this.pose.position.y = clampedY;
  }
  public translateTo(point: Point) {
    // console.log("point=", point);
    const heightWorld = TransformProjection.canvasToViewport(Transform2D.P(0, configuration.styles.primaryRuler.height), this.canvasToViewport).y;
    const clampedX = clamp(point.x, this.worldConstraints.x, Number.isFinite(this.worldConstraints.w) ? this.worldConstraints.x + this.worldConstraints.w : this.worldConstraints.w);
    const clampedY = clamp(point.y, this.worldConstraints.y - heightWorld, Number.isFinite(this.worldConstraints.h) ? this.worldConstraints.y + this.worldConstraints.h : this.worldConstraints.h);
    this.pose.position.x = clampedX;
    this.pose.position.y = clampedY;
  }
  private scaleViewportXY(sx: number, sy: number, auxiliaryOrigin: Point) {

  }
  private scaleViewportX(deltaPPUX: number, startPPU: Vector, startPosition: Point, auxiliaryOrigin: Point) {
    const clampedSx = clamp((startPPU.x * deltaPPUX)/(startPPU.x * startPPU.x), 1/configuration.minPPU.x, 1/configuration.maxPPU.x) * startPPU.x;
    const pose = this.pose.clone();
    pose.position = Transform2D.P(startPosition.x, startPosition.y);
    pose.scale = Transform2D.P(1/startPPU.x, 1/startPPU.y);
    // console.log("auxiliaryOrigin=", auxiliaryOrigin);
    pose.scaleBy(clampedSx, 1, auxiliaryOrigin);
    this.translateTo(pose.position);
    this.ppu = Transform2D.V(1/pose.scale.x, 1/pose.scale.y);
    // console.log(startPosition);
  }
  private scaleViewportY(sy: number, auxiliaryOrigin: Point) {

  }
  public scale(deltaPPU: Vector, startPPU: Vector, startPosition: Point, auxiliaryOrigin: Point) {
    // if(scale.sx !== undefined && scale.sy !== undefined) {
      // this.scaleViewportXY(scale.sx, scale.sy, auxiliaryOrigin);

    this.scaleViewportX(deltaPPU.x, startPPU, startPosition, auxiliaryOrigin);
    // } else if(scale.sx !== undefined) {
    //   this.scaleViewportX(scale.sx, auxiliaryOrigin);
    // } else if(scale.sy !== undefined) {
    //   this.scaleViewportY(scale.sy, auxiliaryOrigin);
    // }
  }
}