import { IWaveSegmentRM, IWaveTrackRM } from "@/ViewModel/interfaces/provided/interfaces";
import { SegmentSnapshot, UniqueId } from "@/ViewModel/interfaces/required/misc";
import { VMWaveSegment } from "@/ViewModel/VMWaveSegment";
import { VMWaveTrack } from "@/ViewModel/VMWaveTrack";

export function mapVMSegmentToWaveSegmentRM(vmSegment: VMWaveSegment, trackId: UniqueId): IWaveSegmentRM {
  const segmentSnapshot: SegmentSnapshot = {
    id: vmSegment.id,
    name: vmSegment.name,
    type: "wave",
    startPosition: vmSegment.segmentStartTime,
    startWithBounds: vmSegment.startWithBounds,
    duration: vmSegment.segmentDuration,
    leftBoundPosition: vmSegment.editableBounds.leftBoundPosition,
    rightBoundPosition: vmSegment.editableBounds.rightBoundPosition,
    durationWidthBounds: vmSegment.durationWidthBounds,
    audioAssetRef: vmSegment.audioAssetRef,
  };

  return {
    trackId,
    segment: segmentSnapshot,
    assetBinary: vmSegment.assetBinary,
    audioBuffer: vmSegment.audioBuffer,
  };
}
export function mapVMTrackToWaveTrackRM(vmTrack: VMWaveTrack): IWaveTrackRM {
  const {
    id,
    musicianName,
    soundSource,
    trackColor,
    trackMixingTools,
    segments,
    y,
  } = vmTrack;
  const { trackMuteState, volumeMeter, trackVolume, trackVolumePower, trackStereoPanorama } = trackMixingTools;

  const rm: IWaveTrackRM = {
    track: {
      id,
      type: "wave",
      name: musicianName,
      y,
      color: {
        index: trackColor.index,
        primary: trackColor.primary,
        text: trackColor.text,
      },
      segments: new Set(segments),
      soundSource,
      musicianName,
      volume: trackVolume,
      panorama: trackStereoPanorama,
      trackMuteState: {
        isMuted: trackMuteState.isMuted,
        isSolo: trackMuteState.isSolo,
        isMutedBySolo: trackMuteState.isMutedBySolo,
        isMutedEventually: trackMuteState.isMutedEventually,
      },
      trackMixingTools: {
        trackVolume,
        trackVolumePower,
        trackStereoPanorama,
        trackMuteState: {
          isMuted: trackMuteState.isMuted,
          isSolo: trackMuteState.isSolo,
          isMutedBySolo: trackMuteState.isMutedBySolo,
          isMutedEventually: trackMuteState.isMutedEventually,
        },
        volumeMeter: {
          leftChannel: {
            volume: volumeMeter.leftChannel.volume,
            peakVolume: volumeMeter.leftChannel.peakVolume,
          },
          rightChannel: {
            volume: volumeMeter.rightChannel.volume,
            peakVolume: volumeMeter.rightChannel.peakVolume,
          },
        },
      },
    },
  };
  return rm;
}
