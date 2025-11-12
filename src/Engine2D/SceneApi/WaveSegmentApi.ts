import { IWaveSegmentApi, IWaveSegmentRM } from "../interfaces/provided/IEngine2D";
import { Scene } from "../Scene/Scene";
import { ViewModel } from "../../ViewModel/ViewModel";

export class WaveSegmentApi implements IWaveSegmentApi {
  constructor(private viewModel: ViewModel, private scene: Scene) {

  }
  addSegment(segmentRM: IWaveSegmentRM): void {
    this.sceneSegments.addWaveSegment(segmentRM);
  }
  removeSegment(): void {
    throw new Error("Method not implemented.");
  }
  /* helpers */
  private get sceneSegments() {
    return this.scene.worldLayer.workarea.worldAnchoredLayer.segments;
  }
  /* /helpers */
  
}