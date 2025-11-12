import { TransformProjectionProvider } from "@Engine2D/TransformProjectionProvider";
import { Viewport } from "@Engine2D/Viewport";
import { Point, Rect, Transform2D } from "@foundation/Geometry";
import { Container, Graphics } from "pixi.js";
import { Tracks } from "./Tracks/Tracks";
import { Segments } from "./Segments/Segments";
import { ViewModel } from "@/ViewModel/ViewModel";
import { InteractionSession } from "@/Application/services/InteractionSession";

export class WorldAnchoredLayer {
  private container: Container;
  private tracks: Tracks;
  public segments: Segments;
  constructor(private viewModel: ViewModel, private parentContainer: Container, private tpp: TransformProjectionProvider, private viewport: Viewport) {
    this.container = new Container({label: "WorldAnchoredLayer"});
    this.tracks = new Tracks();
    this.segments = new Segments(this.viewModel, this.tpp, this.container, this.viewport);
  }

  private addTestLine(graphics: Graphics, start: Point, end: Point) {
    const startPx = this.tpp.worldToWorldContainer(start);
    const endPx = this.tpp.worldToWorldContainer(end);


    graphics.beginPath();
    graphics.moveTo(startPx.x, startPx.y);
    graphics.lineTo(endPx.x, endPx.y);
    graphics.stroke({
      width: 1,
      color: "blue"
    });
  }
  private addTestRect() {
    const testRect: Rect = {
      x: 10,
      y: 10, 
      w: 15,
      h: 15,
    };
    const startPoint = this.tpp.worldToWorldContainer(Transform2D.P(testRect.x, testRect.y));
    const diagonal = this.tpp.worldToWorldContainerVector(Transform2D.V(testRect.w, testRect.h));
    const viewRectPx: Rect = {
      x: startPoint.x,
      y: startPoint.y,
      w: diagonal.x,
      h: diagonal.y,
    }
    const graphics = new Graphics();
    graphics.rect(viewRectPx.x, viewRectPx.y, viewRectPx.w, viewRectPx.h);
    graphics.fill("red");

    const start = Transform2D.P(0,0);
    const end = Transform2D.P(5, 10);
    const startPx = this.tpp.worldToWorldContainer(start);
    const endPx = this.tpp.worldToWorldContainer(end);

    graphics.moveTo(startPx.x, startPx.y);
    graphics.lineTo(endPx.x, endPx.y);
    graphics.stroke({
      width: 5,
      color: "blue"
    });

    // this.addTestLine(graphics, Transform2D.P(30, 0), Transform2D.P(30, 10));
    // this.addTestLine(graphics, Transform2D.P(40, 0), Transform2D.P(40, 10));
    // this.addTestLine(graphics, Transform2D.P(50, 0), Transform2D.P(50, 10));
    // this.addTestLine(graphics, Transform2D.P(100, 0), Transform2D.P(100, 10));


    this.container.addChild(graphics); 
  }
  private addInternals() {
    // this.addTestRect();
    this.tracks.addLayer();
    this.segments.addLayer();
  }
  public addLayer() {
    this.addInternals();
    this.parentContainer.addChild(this.container);
    this.updateContainerPosition();
  }
  private updateContainerPosition() {
    const pointPx = this.tpp.worldToWorldContainer(this.viewport.pose.position);
    this.container.position.set(-pointPx.x, -pointPx.y);
  }
  public onViewportMoved() {
    this.updateContainerPosition();
    this.segments.onViewportMoved();
  }
  public onPPUChanged(interactionSession: InteractionSession) {
    // this.container.removeChildren();
    this.updateContainerPosition();
    this.segments.onPPUChanged(interactionSession);
    // this.addInternals();
  }
     
}