import { Transform2D } from "@/foundation/Geometry";
import { PiecesPlan, WaveformData, WaveformStyle } from "./Waveform";
import { TransformProjectionProvider } from "@/Engine2D/TransformProjectionProvider";
import { Container, Graphics } from "pixi.js";
import { AudioMeta } from "@/Engine2D/interfaces/required/AudioMisc";

export class WaveformPiece {
  private graphics: Graphics;
  constructor(private parentContainer: Container, private tpp: TransformProjectionProvider,
    private heightWorld: number,
    private style: WaveformStyle,
    private waveformData: WaveformData,
    private index: number,
    private piecePlan: PiecesPlan,
  ) {
    this.graphics = new Graphics();
    this.graphics.cacheAsTexture(true);
  }
  private getChannelData(meta: AudioMeta, buffer: AudioBuffer, channelsHint: number): Float32Array[] {
    const targetChannels = Math.max(1, Math.min(meta.channels, channelsHint));
    const data: Float32Array[] = [];
    for (let i = 0; i < targetChannels; i++) {
      data.push(buffer.getChannelData(i));
    }
    return data;
  }
  private calculatePeak(channel: Float32Array, startIndex: number, endIndex: number): number {
    if (startIndex >= channel.length) {
      return 0;
    }
    const start = Math.max(0, startIndex);
    const end = Math.min(channel.length, Math.max(start + 1, endIndex));
    let peak = 0;
    for (let i = start; i < end; i++) {
      const value = Math.abs(channel[i]);
      if (value > peak) {
        peak = value;
      }
    }
    return peak;
  }

  private resolveAmplitudeWorld(peak: number, halfHeightWorld: number, minAmplitudeWorld: number): number {
    if (halfHeightWorld <= 0) {
      return 0;
    }
    if (peak <= 0) {
      return Math.min(halfHeightWorld, minAmplitudeWorld);
    }
    const scaled = peak * halfHeightWorld;
    if (scaled < minAmplitudeWorld) {
      return Math.min(halfHeightWorld, minAmplitudeWorld);
    }
    return Math.min(halfHeightWorld, scaled);
  }
  private renderLineWaveform(
    channelData: Float32Array[],
    waveformData: WaveformData
  ): boolean {
    const { meta } = waveformData;
    const sampleRate = meta.sampleRate;
    if (sampleRate <= 0) {
      return false;
    }
    const primaryChannel = channelData[0];
    if (!primaryChannel || primaryChannel.length === 0) {
      return false;
    }
    const offsetWorld = this.index * this.piecePlan.pieceWidth;

    // const totalSamples = primaryChannel.length;
    const endSample = Math.min(primaryChannel.length-1, Math.floor((this.index+1) * this.piecePlan.pieceWidth * sampleRate));
    const startSample = Math.floor(offsetWorld * sampleRate);
    const totalSamples = endSample - startSample +1;
    const durationSeconds = totalSamples / sampleRate;
    // const durationSeconds = this.piecePlan.pieceWidth;

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      return false;
    }

    const halfHeightWorld = this.heightWorld / 2;
  
    const centerWorldY = halfHeightWorld;
    const startWorldX = this.index * this.piecePlan.pieceWidth;
    const endWorldX = endSample/sampleRate;

    const startBase = this.tpp.worldToWorldContainer(Transform2D.P(startWorldX, centerWorldY));
    const endBase = this.tpp.worldToWorldContainer(Transform2D.P(endWorldX, centerWorldY));
    const pixelColumns = Math.max(
      1,
      Math.round(Math.abs(endBase.x - startBase.x))
    );

    const samplesPerPixel = totalSamples / pixelColumns;
    const pixelsPerWorldY = Math.abs(this.tpp.worldToWorldContainerVector(Transform2D.V(0, 1)).y);
    const minAmplitudeWorld = pixelsPerWorldY > 0 ? 1 / pixelsPerWorldY : 0;

    const topChannel = channelData[0];
    const bottomChannel = channelData[1] ?? channelData[0];

    const topPoints: Array<{ x: number; y: number }> = [];
    const bottomPoints: Array<{ x: number; y: number }> = [];


    
    for (let column = 0; column <= pixelColumns; column++) {
      const timeSec = (column / pixelColumns) * durationSeconds;
      const worldX = startWorldX + timeSec;

      const sampleStart = Math.min(endSample, startSample + Math.floor(column * samplesPerPixel));
      let sampleEnd = Math.min(endSample, startSample + Math.floor((column + 1) * samplesPerPixel));
      if (sampleEnd <= sampleStart) {
        sampleEnd = Math.min(endSample, sampleStart + 1);
      }

      const topPeak = this.calculatePeak(topChannel, sampleStart, sampleEnd);
      const bottomPeak = this.calculatePeak(bottomChannel, sampleStart, sampleEnd);

      const topAmplitude = this.resolveAmplitudeWorld(topPeak, halfHeightWorld, minAmplitudeWorld);
      const bottomAmplitude = this.resolveAmplitudeWorld(bottomPeak, halfHeightWorld, minAmplitudeWorld);

      const topPoint = this.tpp.worldToWorldContainer(Transform2D.P(worldX, centerWorldY - topAmplitude));
      const bottomPoint = this.tpp.worldToWorldContainer(Transform2D.P(worldX, centerWorldY + bottomAmplitude));

      topPoints.push(topPoint);
      bottomPoints.push(bottomPoint);
    }

    if (topPoints.length === 0 || bottomPoints.length === 0) {
      return false;
    }

    this.graphics.beginPath();
    this.graphics.moveTo(topPoints[0].x, topPoints[0].y);
    for (let i = 1; i < topPoints.length; i++) {
      const point = topPoints[i];
      this.graphics.lineTo(point.x, point.y);
    }
    for (let i = bottomPoints.length - 1; i >= 0; i--) {
      const point = bottomPoints[i];
      this.graphics.lineTo(point.x, point.y);
    }
    this.graphics.closePath();

    return true;
  }
  public renderPieceWaveform() {
    this.graphics.clear();
    
    const channelData = this.getChannelData(this.waveformData.meta, this.waveformData.buffer, this.waveformData.meta.channels);
    this.renderLineWaveform(channelData, this.waveformData);
    
    const color = this.style.color ?? "#FF0000";
    const alpha = this.style.alpha ?? 1;

    this.graphics.fill({
      color,
      alpha,
    });
    this.graphics.updateCacheTexture();
  }
  public set visible(visible: boolean) {
    this.graphics.visible = visible;
  }
  public addLayer() {
    this.parentContainer.addChild(this.graphics);

    this.renderPieceWaveform(); //TODO: async
  }
  public update(index: number, piecesPlan: PiecesPlan) {
    this.index = index;
    this.piecePlan = piecesPlan;
    this.renderPieceWaveform(); //TODO: async
  }
}