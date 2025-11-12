export interface TimeSignature {
  upper: number;
  lower: number;
}

export type SecondsGrid = {
  majorMarkStep: number;
  majorMarkStepPower: number; //0.01 ~ -2; 0.1 ~ -1; 1 ~ 0; 10 ~ 1; 100 ~ 2 and so on
  minorMarkCount: number;
};
export type BarsGrid = {
  majorMarkStep: number; //in bars
  timeSignature: TimeSignature;
  minorMarkCount: number;
  power: number;
  isSubdivided: boolean;
  secondsPerBar: number;
};
export type TracksGrid = {
  primaryBandStep: number; //in trackUnits 
}

export interface IGridProvider {
  getSecondsGrid(): SecondsGrid;
  getBarsGrid(): BarsGrid;
  getTracksGrid(): TracksGrid;
}