import { SegmentSnapshot, TrackSnapshot, UniqueId } from "../required/misc";

export interface IWaveSegmentRM {trackId: UniqueId, segment: SegmentSnapshot, assetBinary: Uint8Array, audioBuffer: AudioBuffer}
export interface IWaveTrackRM {
  track: TrackSnapshot;
}

export interface IWaveTrackMBCRM {
  track: TrackSnapshot;
};
export interface IWaveTrackApi {
  addTrack(trackRM: IWaveTrackMBCRM): void;
}
/**
 * main bounded context read model
 */
export interface IWaveSegmentMBCRM {trackId: UniqueId, segment: SegmentSnapshot, assetBinary: Uint8Array, audioBuffer: AudioBuffer}

export interface IWaveSegmentApi {
  addSegment(segmentRM: IWaveSegmentMBCRM): void;
}
export interface IMidiTrackApi {
  
}
export interface IMidiSegmentApi {
  
}
export interface IViewModelApi {
  waveTrack: IWaveTrackApi;
  waveSegment: IWaveSegmentApi;
  midiTrack: IMidiTrackApi;
  midiSegment: IMidiSegmentApi;
}