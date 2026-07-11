/**
 * Pure progress helpers (docs/build/slice-2-plan.md). No I/O, unit-tested.
 * Weight semantics are inverted (design.md 12): moving toward the goal is
 * success, away is warning - the sign of the delta is not the sentiment.
 */

/** Signed distance from goal, kg, rounded to 1 decimal. Negative = below goal. */
export function weightDelta(latestKg: number, targetKg: number): number {
  return Math.round((latestKg - targetKg) * 10) / 10;
}

/**
 * True when the latest weight is closer to the goal than the previous one.
 * This - not the sign of the change - is what colors success (design.md 12:
 * the sentiment is proximity to the goal, and moving toward it is success
 * whether that means losing or gaining).
 */
export function trendToward(
  prevKg: number,
  latestKg: number,
  targetKg: number,
): boolean {
  return Math.abs(latestKg - targetKg) < Math.abs(prevKg - targetKg);
}

/**
 * Y-axis range for the weight chart. Clamps to the data (plus the goal),
 * padded, and NEVER anchored at zero (design.md 12: the weight axis is
 * recut to the relevant range).
 */
export function chartRange(values: number[]): { min: number; max: number } {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return { min: 0, max: 1 };

  let lo = Math.min(...finite);
  let hi = Math.max(...finite);
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const pad = (hi - lo) * 0.1;
  return { min: lo - pad, max: hi + pad };
}
