import { UniqueId } from "@/Engine2D/interfaces/required/misc";
import { WaveSegment } from "./WaveSegment/WaveSegment";
import { Container } from "pixi.js";
import { TransformProjectionProvider } from "@/Engine2D/TransformProjectionProvider";
import { IWaveSegmentRM } from "@/Engine2D/interfaces/provided/IEngine2D";
import { ViewModel } from "@/ViewModel/ViewModel";
import { Viewport } from "@/Engine2D/Viewport";
import { InteractionSession } from "@/Application/services/InteractionSession";
import { WorkerOrchestrator } from "@/WorkerOrchestrator";

export class Segments {
  private container: Container;

  private waveSegments: Map<UniqueId, WaveSegment> = new Map();
  constructor(private viewModel: ViewModel, private tpp: TransformProjectionProvider, private parentContainer: Container, private viewport: Viewport,
    private workerOrchestrator: WorkerOrchestrator
  ) {
    this.container = new Container({label: "Segments"});
  }
  public addLayer() {
    this.parentContainer.addChild(this.container);
  }
  public addWaveSegment(segmentRM: IWaveSegmentRM) {
    const waveSegment = new WaveSegment(segmentRM, this.viewModel, this.tpp, this.container, this.viewport, this.workerOrchestrator);
    this.waveSegments.set(segmentRM.segment.id, waveSegment);
    waveSegment.addLayer();
  }
  public onPPUChanged(interactionSession: InteractionSession) {
    for(const segment of this.waveSegments.values()) {
      segment.onPPUChanged(interactionSession);
    }
  }
  public onViewportMoved() {
    for(const segment of this.waveSegments.values()) {
      segment.onViewportMoved();
    }
  }
}