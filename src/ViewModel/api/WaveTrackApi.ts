import { IEventEmitter } from "@/Application/interfaces/required/IEventEmitter";
import { IWaveTrackApi, IWaveTrackMBCRM } from "../interfaces/provided/interfaces";
import { UniqueId } from "../interfaces/required/misc";
import { VMWaveTrack } from "../VMWaveTrack";
import { ViewModelEventMap } from "../ViewModel";
import { mapVMTrackToWaveTrackRM } from "./mapping";

export class WaveTrackApi implements IWaveTrackApi {
  constructor(private eventEmitter: IEventEmitter<ViewModelEventMap>, private waveTracks: Map<UniqueId, VMWaveTrack>) {

  }
  addTrack(trackRM: IWaveTrackMBCRM): void {
    const vmTrack = new VMWaveTrack(trackRM);
    this.waveTracks.set(vmTrack.id, vmTrack);
    this.eventEmitter.emit('addWaveTrack', {
      waveTrack: mapVMTrackToWaveTrackRM(vmTrack),
    });
  }
}