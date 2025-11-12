import { Application, Container, Graphics } from "pixi.js";
import { XAxisLockedLayer } from "./XAxisLockedLayer";
import { YAxisLockedLayer } from "./YAxisLockedLayer";
import { WorldAnchoredLayer } from "./WorldAnchoredLayer/WorldAnchoredLayer";
import { TransformProjectionProvider } from "@Engine2D/TransformProjectionProvider";
import { Viewport } from "@Engine2D/Viewport";
import { IGridProvider } from "@Engine2D/interfaces/required/IGridProvider";
import { configuration } from "@Engine2D/data/configuration";
import { ViewModel } from "@/ViewModel/ViewModel";
import { InteractionSession } from "@/Application/services/InteractionSession";

export class Workarea {
  public worldAnchoredLayer: WorldAnchoredLayer;
  private xAxisLockedLayer: XAxisLockedLayer;
  private yAxisLockedLayer: YAxisLockedLayer;

  private container: Container;
  private mask: Graphics;

  constructor(private viewModel: ViewModel, private pixiApp: Application, private parentContainer: Container, private tpp: TransformProjectionProvider, private viewport: Viewport, private gridProvider: IGridProvider) {
    this.container = new Container({label: "Workarea"});
    this.mask = new Graphics();
    this.worldAnchoredLayer = new WorldAnchoredLayer(this.viewModel, this.container, this.tpp, this.viewport);
    this.xAxisLockedLayer = new XAxisLockedLayer(this.pixiApp, this.container, this.tpp, this.viewport, this.gridProvider);
    this.yAxisLockedLayer = new YAxisLockedLayer(this.pixiApp, this.container, this.tpp, this.viewport, this.gridProvider);
  
  }
  private addMask() {
    this.updateMask();
    this.container.mask = this.mask;
  }
  private updateMask() {
    this.mask.clear();
    this.mask.rect(0, configuration.styles.primaryRuler.height, this.viewport.viewWidthPx, this.viewport.viewHeightPx - configuration.styles.primaryRuler.height - configuration.styles.secondaryRuler.height);
    this.mask.fill("#FFFFFF");
  }
  public addLayer() {
    this.addMask();

    this.worldAnchoredLayer.addLayer();
    this.xAxisLockedLayer.addLayer();
    this.yAxisLockedLayer.addLayer();

    this.parentContainer.addChild(this.mask);
    this.parentContainer.addChild(this.container);
  }
  public onViewportMoved() {
    this.worldAnchoredLayer.onViewportMoved();
    this.yAxisLockedLayer.onViewportMoved();
    this.xAxisLockedLayer.onViewportMoved();
  }
  public onPPUChanged(interactionSession: InteractionSession) {
    this.worldAnchoredLayer.onPPUChanged(interactionSession);
    this.yAxisLockedLayer.onPPUChanged();
    this.xAxisLockedLayer.onPPUChanged();
  }
  public onCanvasResize() {
    this.updateMask();
    this.yAxisLockedLayer.onCanvasResize();
    this.xAxisLockedLayer.onCanvasResize();

  }
}