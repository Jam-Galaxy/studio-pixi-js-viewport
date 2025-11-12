import { Container, Graphics } from "pixi.js";
import { BaseSegment } from "../BaseSegment";
import { TransformProjectionProvider } from "@/Engine2D/TransformProjectionProvider";
import { Transform2D } from "@/foundation/Geometry";
import { configuration } from "@/Engine2D/data/configuration";
import { IWaveSegmentRM } from "@/Engine2D/interfaces/provided/IEngine2D";
import { UniqueId } from "@/Engine2D/interfaces/required/misc";
import { ViewModel } from "@/ViewModel/ViewModel";
import { Waveform, WaveformData, WaveformStyle } from "./Waveform/Waveform";
import { Viewport } from "@/Engine2D/Viewport";
import { InteractionSession } from "@/Application/services/InteractionSession";

export class WaveSegment extends BaseSegment {
  private id: UniqueId;
  private container: Container;
  private bgGraphics: Graphics;
  private waveform: Waveform;

  constructor(segmentRM: IWaveSegmentRM, private viewModel: ViewModel, private tpp: TransformProjectionProvider, private parentContainer: Container, private viewport: Viewport) {
    super();
    this.id = segmentRM.segment.id;
    this.container = new Container({label: "WaveSegment"});
    this.bgGraphics = new Graphics();
    this.waveform = new Waveform(this.container, this.tpp, this.viewport, this.viewModel, this.id, this.getWaveformData(), this.getWaveformStyle(), this.getWaveformHeightWorld());
    this.container.addChild(this.bgGraphics);
    this.waveform.addLayer();
    this.update();
  }
  private getVMSegment() {
    const vmSegment = this.viewModel.waveSegments.get(this.id);
    if(!vmSegment) {
      throw new Error;
    }
    return vmSegment;
  }
  private getWaveformData() {
    const vmSegment = this.getVMSegment();
    const waveformData: WaveformData = {
      meta: {
        sampleRate: vmSegment.audioAssetRef.sampleRate,
        channels: vmSegment.audioAssetRef.channels,
        numFrames: vmSegment.audioAssetRef.numFrames,
        durationSec: vmSegment.audioAssetRef.durationSec,
      },
      buffer: vmSegment.audioBuffer,
    }
    return waveformData;
  }
  private getWaveformStyle() {
    const style: WaveformStyle = {
      color: "#0000FF",
      alpha: 1,
    }
    return style;
  }
  private getWaveformHeightWorld() {
    const gapPx = configuration.styles.workarea.tracksZebra.gap;
    const pixelsPerWorldY = Math.abs(this.tpp.worldToWorldContainerVector(Transform2D.V(0, 1)).y);
    const gapWorldUnits = pixelsPerWorldY === 0 ? 0 : gapPx / pixelsPerWorldY;
    const waveformHeightWorld = Math.max(0, 1 - gapWorldUnits);
    return waveformHeightWorld;
  }
  private update() {
    this.bgGraphics.clear();
    const vmSegment = this.getVMSegment();
    const vmTrack = Array.from(this.viewModel.waveTracks.values()).find(track => track.segments.has(this.id));
    if(!vmTrack) {
      throw new Error;
    }
    const positionPx = this.tpp.worldToWorldContainer(Transform2D.P(vmSegment.segmentStartTime, vmTrack.y));
    this.container.x = positionPx.x;
    this.container.y = positionPx.y;

    const diagonal = this.tpp.worldToWorldContainerVector(Transform2D.V(vmSegment.durationWidthBounds, 1));
    diagonal.y -= configuration.styles.workarea.tracksZebra.gap;
    
    this.bgGraphics.roundRect(0, 0, diagonal.x, diagonal.y, 10);
    this.bgGraphics.fill({color: 'green'});
  }
  public addLayer() {
    this.parentContainer.addChild(this.container);
  }
  public onViewportMoved() {
    this.waveform.onViewportMoved();
  }
  public onPPUChanged(interactionSession: InteractionSession) {
    this.update();
    this.waveform.onPPUChanged(interactionSession);
  }

}
