import { Application, Container } from "pixi.js";
import { PrimaryRuler } from "./PrimaryRuler"
import { SecondaryRuler } from "./SecondaryRuler";
import { TransformProjectionProvider } from "@Engine2D/TransformProjectionProvider";
import { Viewport } from "@Engine2D/Viewport";
import { IGridProvider } from "@Engine2D/interfaces/required/IGridProvider";

export class WorldOverlay {
  private container: Container;
  private primaryRuler: PrimaryRuler;
  private secondaryRuler: SecondaryRuler;
  constructor(private pixiApp: Application, private parentContainer: Container, private tpp: TransformProjectionProvider,
    private viewport: Viewport,
    private gridProvider: IGridProvider,
  ) {
    this.container = new Container({label: "WorldOverlay"});
    this.primaryRuler = new PrimaryRuler(this.pixiApp, this.container, this.tpp, this.viewport, this.gridProvider);
    this.secondaryRuler = new SecondaryRuler(this.pixiApp, this.container, this.tpp, this.viewport, this.gridProvider);
  }
  public addLayer() {
    this.primaryRuler.addRuler();
    this.secondaryRuler.addRuler();
    this.parentContainer.addChild(this.container);
  }
  public onViewportMoved() {
    this.primaryRuler.onViewportMoved();
    this.secondaryRuler.onViewportMoved();
  }
  public onPPUChanged() {
    this.primaryRuler.onPPUChanged();
    this.secondaryRuler.onPPUChanged();
  }
  public onCanvasResize() {
    this.primaryRuler.onCanvasResize();
    this.secondaryRuler.onCanvasResize();
  }
}