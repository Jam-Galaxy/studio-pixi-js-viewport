import { IEventEmitter } from "@/Application/interfaces/required/IEventEmitter";
import { IWaveSegmentApi, IWaveSegmentMBCRM, IWaveSegmentRM } from "../interfaces/provided/interfaces";
import { ViewModelEventMap } from "../ViewModel";
import { UniqueId } from "../interfaces/required/misc";
import { VMWaveSegment } from "../VMWaveSegment";
import { VMWaveTrack } from "../VMWaveTrack";
import { mapVMSegmentToWaveSegmentRM } from "./mapping";

export class WaveSegmentApi implements IWaveSegmentApi {
  constructor(private eventEmitter: IEventEmitter<ViewModelEventMap>, private tracks: Map<UniqueId, VMWaveTrack>, private segments: Map<UniqueId, VMWaveSegment>) {

  }
  public addSegment(segmentRM: IWaveSegmentMBCRM): void {
    const track = this.tracks.get(segmentRM.trackId);
    if(track) {
      track.segments.add(segmentRM.segment.id);
    }
    const vmSegment = new VMWaveSegment(segmentRM);
    this.segments.set(segmentRM.segment.id, vmSegment);
    this.eventEmitter.emit('addWaveSegment', {
      waveSegment: mapVMSegmentToWaveSegmentRM(vmSegment, segmentRM.trackId),
    });
  }
}