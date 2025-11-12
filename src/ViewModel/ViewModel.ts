import { BaseEventMap, IEventEmitter } from "@/Application/interfaces/required/IEventEmitter";
import { UniqueId } from "./interfaces/required/misc";
import { VMWaveSegment } from "./VMWaveSegment";
import { VMWaveTrack } from "./VMWaveTrack";
import EventEmitter from "@/infrastructure/EventEmitter";
import { IViewModelApi, IWaveSegmentRM, IWaveTrackRM } from "./interfaces/provided/interfaces";
import { WaveTrackApi } from "./api/WaveTrackApi";
import { WaveSegmentApi } from "./api/WaveSegmentApi";
import { MidiTrackApi } from "./api/MidiTrackApi";
import { MidiSegmentApi } from "./api/MidiSegmentApi";

export type ViewModelEventMap = {
  'addWaveTrack': [{waveTrack: IWaveTrackRM}]
  'addWaveSegment': [{waveSegment: IWaveSegmentRM}]
}

export class ViewModel {
  public eventEmitter: IEventEmitter<ViewModelEventMap>;
  public waveTracks: Map<UniqueId, VMWaveTrack>;
  public waveSegments: Map<UniqueId, VMWaveSegment>;
  public api: IViewModelApi;
  constructor() {
    this.eventEmitter = new EventEmitter<ViewModelEventMap>();
    this.waveTracks = new Map();
    this.waveSegments = new Map();
    this.api = {
      waveTrack: new WaveTrackApi(this.eventEmitter, this.waveTracks),
      waveSegment: new WaveSegmentApi(this.eventEmitter, this.waveTracks, this.waveSegments),
      midiTrack: new MidiTrackApi(),
      midiSegment: new MidiSegmentApi(),
    }
  }
  
}