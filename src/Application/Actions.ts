import { MockAudioInspector } from "@/mocks/MockAudioInspector";
import { mockWaveTrackMBCRM, getMockWaveSegmentMBCRM } from "@/mocks/MockSegmentData/MockAddWaveSegmentRequest";
import { ViewModel } from "@/ViewModel/ViewModel";
import { Engine2D } from "@Engine2D/index";
import { Point, Transform2D, Vector } from "@foundation/Geometry";
import { InteractionSession } from "./services/InteractionSession";
import { WorkerOrchestrator } from "@/WorkerOrchestrator";
import { isSuccess } from "@/WorkerOrchestrator/TaskRegistry/TaskRegistryDerivatives";

export class Actions {
  constructor(private viewModel: ViewModel, private engine2D: Engine2D, private audioInspector: MockAudioInspector, private workerOrchestrator: WorkerOrchestrator) {

  }
  public dragViewport(event: PointerEvent, movementX: number, movementY: number) {
    this.engine2D.moveViewport(Transform2D.V(-movementX, -movementY));
  }
  public setPPUX(value: number) {
    this.engine2D.setPPU({x: value});
  }
  public setPPUY(value: number) {
    this.engine2D.setPPU({y: value});
  }
  public scaleViewport(interactionSession: InteractionSession, auxiliaryOrigin: Point) {
    this.engine2D.scaleViewport(interactionSession, auxiliaryOrigin);
  }

  public addMockTrack() {
    const trackMBCRM = mockWaveTrackMBCRM;
    this.viewModel.api.waveTrack.addTrack(trackMBCRM);
  }
  public async addMockSegment() {

    const segmentMBCRM = await getMockWaveSegmentMBCRM(this.audioInspector);
    this.viewModel.api.waveSegment.addSegment(segmentMBCRM);
  }

  public async addMockTracks(count: number) {
    const trackMBCRM = mockWaveTrackMBCRM;
    const trackCount = count;
    
    const segmentMBCRM = await getMockWaveSegmentMBCRM(this.audioInspector);

    for(let i =0; i<trackCount; i++) {
      trackMBCRM.track.id = `track-${i}`;
      trackMBCRM.track.y = i;

      this.viewModel.api.waveTrack.addTrack(trackMBCRM);

      segmentMBCRM.segment.id = `segment-${i}`;
      segmentMBCRM.trackId = trackMBCRM.track.id;
      this.viewModel.api.waveSegment.addSegment(segmentMBCRM);
    }
  }
  public async workerTest() {
    const taskRequest = {
      name: "drawWaveform" as const,
      payload: {
        field1: 123,
      },
      batchId: "333"
    }
    const response = await this.workerOrchestrator.submit(taskRequest);
    console.log("response=", response);
    if(isSuccess(response)) {
      // console.log("response.result=", response.result);
    } else {
      // console.log("response.error=", response.error);
    }
  }
}