import { Application } from "pixi.js";
import { TransformProjectionProvider } from "../TransformProjectionProvider";
import { Overlay } from "./Overlay";
import { WorldLayer } from "./WorldLayer/WorldLayer";
import { DomEventListener } from "../DomEventListener";
import { Viewport } from "../Viewport";
import { IGridProvider } from "../interfaces/required/IGridProvider";
import { ViewModel } from "@/ViewModel/ViewModel";
import { InteractionSession } from "@/Application/services/InteractionSession";
import { WorkerOrchestrator } from "@/WorkerOrchestrator";

export class Scene {
  private tpp: TransformProjectionProvider;
  public worldLayer: WorldLayer;
  private overlay: Overlay;
  constructor(private viewModel: ViewModel, private pixiApp: Application, transformProjectionProvider: TransformProjectionProvider, private domEventListener: DomEventListener,
    private viewport: Viewport,
    private gridProvider: IGridProvider,
    private workerOrchestrator: WorkerOrchestrator,
  ) {
    this.tpp = transformProjectionProvider;
    this.worldLayer = new WorldLayer(this.viewModel, this.pixiApp, this.tpp, this.viewport, this.gridProvider, this.workerOrchestrator);
    this.overlay = new Overlay(this.pixiApp, this.tpp, this.domEventListener);
  }
  
  public initialize() {
    this.worldLayer.addLayer();
    this.overlay.addLayer(); 
  }
  public onViewportMoved() {
    this.worldLayer.onViewportMoved();
  }
  public onPPUChanged(interactionSession: InteractionSession) {
    this.worldLayer.onPPUChanged(interactionSession);
  }
  public onCanvasResize() {
    this.worldLayer.onCanvasResize();
  }
}