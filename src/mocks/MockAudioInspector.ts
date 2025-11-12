import { AudioMeta } from "@/Engine2D/interfaces/required/AudioMisc";

type Result = {
  buffer: AudioBuffer,
  meta: AudioMeta
} 
export class MockAudioInspector {
  public async inspectAudio(src: string): Promise<Result> {
    const arrayBuffer = await (await fetch(src)).arrayBuffer();
    const context = new AudioContext();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    return {
      buffer: audioBuffer,
      meta: {
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
        numFrames: audioBuffer.length,
        durationSec: audioBuffer.duration
      }
    }
  }
}