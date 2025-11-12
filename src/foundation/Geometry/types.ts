export type Point = {
  x: number;
  y: number;
} & { __brand: 'Point' };
export type Vector = {
  x: number;
  y: number;
} & { __brand: 'Vector' };
export type Rect = { x: number; y: number; w: number; h: number };

/**
 * assume end >= start
 */
export type Range = { start: number; end: number };

export type HomogeneousPoint = [number, number, number];

export type TransformationMatrix = [[number, number, number], [number, number, number], [number, number, number]];

