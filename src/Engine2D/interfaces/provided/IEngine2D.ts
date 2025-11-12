import { Point, Vector } from "@foundation/Geometry";
import { SegmentSnapshot, TrackSnapshot, UniqueId } from "../required/misc";
import { ITPP } from "./ITPP";

export interface IWaveTrackRM {
  track: TrackSnapshot;
}

export interface IWaveTrackApi {
  addTrack(trackRM: IWaveTrackRM): void;
  removeTrack(id: UniqueId): void;
}
export interface IWaveSegmentRM {trackId: UniqueId, segment: SegmentSnapshot, assetBinary: Uint8Array, audioBuffer: AudioBuffer}
export interface IWaveSegmentApi {
  addSegment(segmentRM: IWaveSegmentRM): void;
  removeSegment(): void;
}
export interface IMidiTrackApi {
  addTrack(): void;
  removeTrack(): void;
}
export interface IMidiSegmentApi {
  addSegment(): void;
  removeSegment(): void;
}

export interface ISceneApi {
  waveTrack: IWaveTrackApi;
  waveSegment: IWaveSegmentApi;

  midiTrack: IMidiTrackApi;
  midiSegment: IMidiSegmentApi;
}

export interface IEngine2D {
  tpp: ITPP;
  sceneApi: ISceneApi;
}