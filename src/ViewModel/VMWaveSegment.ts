import { IWaveSegmentMBCRM } from "./interfaces/provided/interfaces";
import { AudioAssetRef, UniqueId } from "./interfaces/required/misc";
import { VMBaseSegment } from "./VMBaseSegment";

export class VMWaveSegment extends VMBaseSegment {
  public id: UniqueId;
  public name: string;
  public segmentStartTime: number;
  public segmentDuration: number;

  public assetBinary: Uint8Array;
  public audioBuffer: AudioBuffer;
  public audioAssetRef: AudioAssetRef;
  public startWithBounds: number;
  public durationWidthBounds: number;

  public editableBounds: {
    leftBoundPosition: number;
    rightBoundPosition: number;
  };

  constructor(segmentRM: IWaveSegmentMBCRM) {
    super();
    const { segment, assetBinary, audioBuffer } = segmentRM;
    this.id = segment.id;
    this.name = segment.name;
    this.segmentStartTime = segment.startPosition;
    this.segmentDuration = segment.duration;
    this.assetBinary = assetBinary;
    this.audioBuffer = audioBuffer;
    this.audioAssetRef = segment.audioAssetRef;
    this.startWithBounds = segment.startWithBounds;
    this.durationWidthBounds = segment.durationWidthBounds;
    this.editableBounds = {
      leftBoundPosition: segment.leftBoundPosition,
      rightBoundPosition: segment.rightBoundPosition,
    };
  }
}
