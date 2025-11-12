/* Pure Geometry */
import { Range, Rect } from "./types";

/* snap */
/**
 * 
 * @param value coordinate on the number axis
 * @param origin zero countdown/offset
 * @param step grid step (in the same units)
 * @param threshold max. distance for "sticking"
 * @returns a new coordinate on the number axis
 */
export function snapToStep(value: number, origin: number, step: number, threshold?: number): number {
  if (step <= 0) return value;
  const k = Math.round((value - origin) / step);
  const candidate = origin + k * step;
  if (threshold == null) return candidate;
  return Math.abs(candidate - value) <= threshold ? candidate : value;
}


/**
 * 
 * @param value 
 * @param anchors arbitrary points on number axis
 * @param threshold 
 * @returns 
 */
export function snapToAnchors(
  value: number,
  anchors: number[],
  threshold?: number
): number {
  if (!anchors.length) return value;
  let best = value, bestD = Number.POSITIVE_INFINITY;
  for (const a of anchors) {
    const d = Math.abs(a - value);
    if (d < bestD) { bestD = d; best = a; }
  }
  return (threshold != null && bestD > threshold) ? value : best;
}
/* /snap */

/* clamp */
export function clamp(value: number, rangeBound1: number, rangeBound2: number) {
  let min;
  let max;
  if (rangeBound1 < rangeBound2) {
    min = rangeBound1;
    max = rangeBound2;
  } else {
    min = rangeBound2;
    max = rangeBound1;
  }
  return value < min ? min : value > max ? max : value;
}

/**
 * move or shrink the `range` interval so that it fits within the `bounds`
 * @param range Interval to move or shrink.
 * @param bounds Bounding interval to fit into.
 * @param mode Strategy, e.g. "translate" | "shrink".
 * @returns New interval that fits within `bounds`.
 */
export function clampRange(range: Range, bounds: Range, mode: 'translate'|'shrink'|'none'='translate'): Range {
  let { start, end } = range;
  const rangeLength = end - start, boundsLength = bounds.end - bounds.start;
  if (mode === 'shrink' && rangeLength > boundsLength) {
    // shrinking
    return { start: bounds.start, end: bounds.end };
  }
  // translate: first hold the left bound, then the right
  if (start < bounds.start) { end -= (start - bounds.start); start = bounds.start; }
  if (end > bounds.end)     { start -= (end - bounds.end);   end   = bounds.end; }
  return { start, end };
}
/* /clamp */

/**
 * 
 * @param rect 
 * @param bounds 
 * @returns 
 */
export function clampRect(rect: Rect, bounds: Rect): Rect {
  let x = rect.x, y = rect.y;
  if (x + rect.w > bounds.x + bounds.w) x = bounds.x + bounds.w - rect.w;
  if (y + rect.h > bounds.y + bounds.h) y = bounds.y + bounds.h - rect.h;
  if (x < bounds.x) x = bounds.x;
  if (y < bounds.y) y = bounds.y;
  return { x, y, w: rect.w, h: rect.h };
}



export function compose() {

}
export function nearest(value: number, target1: number, target2: number) {
  const difference1 = Math.abs(value - target1);
  const difference2 = Math.abs(value - target2);
  if(difference1 <= difference2) {
    return 1;
  } else {
    return 2;
  }

}
export function belongsToRange(value: number, range: Range): boolean {
  return (value >= range.start && value <=range.end); 
}