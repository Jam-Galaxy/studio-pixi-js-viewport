export type UniqueId = string;

export interface IBaseSegmentSnapshot {
  id: UniqueId;
  name: string;
  startPosition: number;
  startWithBounds: number;
}

export interface SegmentSnapshot extends IBaseSegmentSnapshot {
  type: "wave";

  duration: number,

  leftBoundPosition: number,
  rightBoundPosition: number,
  durationWidthBounds: number,
  audioAssetRef: AudioAssetRef,
}

export type AudioFormat = 'wav'|'flac'|'mp3'|'aac'|'ogg'|'unknown';

export class AudioAssetRef {
  constructor(
    public readonly assetId: UniqueId,
    public readonly format: AudioFormat,
    public readonly sampleRate: number,
    public readonly channels: number,
    public readonly durationSec: number,
    public readonly numFrames: number,
  ) {

  }
  public equals(other: AudioAssetRef) {
    return JSON.stringify(this) === JSON.stringify(other);
  }
}

export type ColorString = string;

export type TrackColor = {
  index: number;
  primary: ColorString;
  text: ColorString;
};

export type TrackType = "wave" | "midi";

export interface IBaseTrackSnapshot {
  id: UniqueId;
  type: TrackType;
  name: string;
  y: number;
  color: TrackColor;
  segments: Set<UniqueId>;
}
export type TrackMuteStateSnapshot = {
  isMuted: boolean;
  isSolo: boolean;
  isMutedBySolo: boolean;
  isMutedEventually: boolean;
}

export type TrackMixingTools = {
  trackVolume: number; //float [0...1]
  trackVolumePower: number; //float [-Infinity...+Infinity]
  trackStereoPanorama: number; //float [-1...1]
  trackMuteState: {
    isMuted: boolean; //is this track muted by "mute" button
    isSolo: boolean; //is chosen as solo track by "solo" button
    isMutedBySolo: boolean; //is this track muted because some other track is soloed
    isMutedEventually: boolean; //is this track muted eventually (by a button, due to another solo track or for some other reason)
  };
  volumeMeter: {
    leftChannel: {
      volume: number; //0..1
      peakVolume: number; //0..1
    };
    rightChannel: {
      volume: number;
      peakVolume: number;
    };
  };
};

export interface TrackSnapshot extends IBaseTrackSnapshot {
  type: "wave";
  soundSource: string;
  musicianName: string;
  volume: number;
  panorama: number;
  trackMuteState: TrackMuteStateSnapshot;
  trackMixingTools: TrackMixingTools;
}