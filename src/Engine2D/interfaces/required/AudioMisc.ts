export type AudioFormat = 'wav'|'flac'|'mp3'|'aac'|'ogg'|'unknown';

export type AudioMeta = {
  sampleRate: number;
  channels: number;
  numFrames: number;
  durationSec: number;
};