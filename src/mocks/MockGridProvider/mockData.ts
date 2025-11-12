import { BarsGrid, SecondsGrid } from "@Engine2D/interfaces/required/IGridProvider";

export const secondsGrid1: SecondsGrid = {
  majorMarkStep: 1,
  majorMarkStepPower: 1,
  minorMarkCount: 9
}

export const secondsGrid2: SecondsGrid = {
  majorMarkStep: 1,
  majorMarkStepPower: 1,
  minorMarkCount: 1
}

export const secondsGrid3: SecondsGrid = {
  majorMarkStep: 10,
  majorMarkStepPower: 2,
  minorMarkCount: 2
}

export const secondsGrid4: SecondsGrid = {
  majorMarkStep: 0.1,
  majorMarkStepPower: -1,
  minorMarkCount: 3
}

export const barsGrid1: BarsGrid = {
  majorMarkStep: 0.5,
  minorMarkCount: 1,
  power: -1,
  isSubdivided: true,
  secondsPerBar: 2,
  timeSignature: {upper: 2, lower: 4}
}

export const barsGrid2: BarsGrid = {
  majorMarkStep: 2,
  minorMarkCount: 1,
  power: 1,
  isSubdivided: false,
  secondsPerBar: 1,
  timeSignature: {upper: 2, lower: 4}
}

export const barsGrid3: BarsGrid = {
  majorMarkStep: 0,
  minorMarkCount: 0,
  power: 0,
  isSubdivided: false,
  timeSignature: {upper: 2, lower: 4},
  secondsPerBar: 0
}

export const barsGrid4: BarsGrid = {
  majorMarkStep: 0,
  minorMarkCount: 0,
  power: 0,
  isSubdivided: false,
  timeSignature: {upper: 2, lower: 4},
  secondsPerBar: 0
}