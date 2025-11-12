import { AudioAssetRef } from "@/Engine2D/interfaces/required/misc";
import { IWaveSegmentMBCRM, IWaveSegmentRM, IWaveTrackMBCRM } from "@/ViewModel/interfaces/provided/interfaces";
import { MockAudioInspector } from "../MockAudioInspector";

export const mockWaveTrackMBCRM: IWaveTrackMBCRM = {
  track: {
    type: "wave",
    soundSource: "",
    musicianName: "",
    volume: 0,
    panorama: 0,
    trackMuteState: {
      isMuted: false,
      isSolo: false,
      isMutedBySolo: false,
      isMutedEventually: false
    },
    trackMixingTools: {
      trackVolume: 0,
      trackVolumePower: 0,
      trackStereoPanorama: 0,
      trackMuteState: {
        isMuted: false,
        isSolo: false,
        isMutedBySolo: false,
        isMutedEventually: false
      },
      volumeMeter: {
        leftChannel: {
          volume: 0,
          peakVolume: 0
        },
        rightChannel: {
          volume: 0,
          peakVolume: 0
        }
      }
    },
    id: "mockWaveTrack1",
    name: "",
    y: 1,
    color: {
      index: 0,
      primary: "#FF00FF",
      text: ""
    },
    segments: new Set(),
  }
}


export async function getMockWaveSegmentMBCRM(audioInspector: MockAudioInspector) {
  const src = "sample1.wav"
  // const src = "bassdrum.wav"

  const inspectionResult = await audioInspector.inspectAudio(src);


  const mockAudioAssetRef = new AudioAssetRef(
    "",
    "wav",
    inspectionResult.meta.sampleRate,
    inspectionResult.meta.channels,
    inspectionResult.meta.durationSec,
    inspectionResult.meta.numFrames,
  );

  const mockWaveSegmentMBCRM: IWaveSegmentMBCRM = {
    trackId: "mockWaveTrack1",
    segment: {
      type: "wave",
      duration: inspectionResult.meta.durationSec,
      leftBoundPosition: 0,
      rightBoundPosition: 0,
      durationWidthBounds: inspectionResult.meta.durationSec,
      audioAssetRef: mockAudioAssetRef,
      id: "",
      name: "",
      startPosition: 1,
      startWithBounds: 1
    },
    assetBinary: new Uint8Array(),
    audioBuffer: inspectionResult.buffer,
  }
  return mockWaveSegmentMBCRM;
}