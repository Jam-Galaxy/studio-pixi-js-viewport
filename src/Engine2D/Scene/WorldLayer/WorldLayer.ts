import { Application, Container, Graphics } from "pixi.js";
import { TransformProjectionProvider } from "../../TransformProjectionProvider";
import { Rect, Transform2D } from "@foundation/Geometry";
import { Viewport } from "../../Viewport";
import { Workarea } from "./Workarea";
import { WorldOverlay } from "./WorldOverlay";
import { IGridProvider } from "@Engine2D/interfaces/required/IGridProvider";
import { ViewModel } from "@/ViewModel/ViewModel";
import { InteractionSession } from "@/Application/services/InteractionSession";

export class WorldLayer {
  private tpp: TransformProjectionProvider;
  private worldContainer: Container;
  public workarea: Workarea;
  private worldOverlay: WorldOverlay;

  constructor(private viewModel: ViewModel, private pixiApp: Application, transformProjectionProvider: TransformProjectionProvider,
    private viewport: Viewport,
    private gridProvider: IGridProvider
  ) {
    this.tpp = transformProjectionProvider;
    this.worldContainer = new Container({label: "WorldLayer"});
    this.workarea = new Workarea(this.viewModel, this.pixiApp, this.worldContainer, this.tpp, this.viewport, this.gridProvider);
    this.worldOverlay = new WorldOverlay(this.pixiApp, this.worldContainer, this.tpp, this.viewport, this.gridProvider);
  }
 
  public addLayer() {
    this.pixiApp.stage.addChild(this.worldContainer);

    this.workarea.addLayer();
    this.worldOverlay.addLayer();
  }
  public onViewportMoved() {
    this.worldOverlay.onViewportMoved();
    this.workarea.onViewportMoved();
  }
  public onPPUChanged(interactionSession: InteractionSession) {
    this.worldOverlay.onPPUChanged();
    this.workarea.onPPUChanged(interactionSession);
  }
  public onCanvasResize() {
    this.worldOverlay.onCanvasResize();
    this.workarea.onCanvasResize();
  }
}