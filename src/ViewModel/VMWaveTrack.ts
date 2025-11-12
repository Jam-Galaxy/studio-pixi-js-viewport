import { IWaveTrackMBCRM } from "./interfaces/provided/interfaces";
import { TrackColor, UniqueId } from "./interfaces/required/misc";
import { VMBaseTrack } from "./VMBaseTrack";


export type VMTrackMixingTools = {
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



export class VMWaveTrack extends VMBaseTrack {
  public id: UniqueId;
  public segments: Set<UniqueId>;

  public y: number; //trackUnits
  public musicianName: string;
  public soundSource: string;
  public trackColor: TrackColor;
  public trackMixingTools: VMTrackMixingTools;

  constructor(trackRM: IWaveTrackMBCRM) {
    super();
    const { track: {
      id,
      y,
      musicianName,
      soundSource,
      color,
      trackMixingTools,
      segments,
      }
    } = trackRM;
    this.id = id;
    this.y = y;
    this.musicianName = musicianName;
    this.soundSource = soundSource;
    this.trackColor = { ...color };
    this.trackMixingTools = {
      trackVolume: trackMixingTools.trackVolume,
      trackVolumePower: trackMixingTools.trackVolumePower,
      trackStereoPanorama: trackMixingTools.trackStereoPanorama,
      trackMuteState: {
        isMuted: trackMixingTools.trackMuteState.isMuted,
        isSolo: trackMixingTools.trackMuteState.isSolo,
        isMutedBySolo: trackMixingTools.trackMuteState.isMutedBySolo,
        isMutedEventually: trackMixingTools.trackMuteState.isMutedEventually,
      },
      volumeMeter: {
        leftChannel: {
          volume: trackMixingTools.volumeMeter.leftChannel.volume,
          peakVolume: trackMixingTools.volumeMeter.leftChannel.peakVolume,
        },
        rightChannel: {
          volume: trackMixingTools.volumeMeter.rightChannel.volume,
          peakVolume: trackMixingTools.volumeMeter.rightChannel.peakVolume,
        },
      },
    };
    this.segments = new Set(segments?? []);
  }
}
