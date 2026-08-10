/**
 * Body-composition derivations (docs/build/slice-12-plan.md). Pure math over
 * manual entries - estimates, not clinical measurements.
 */
export function waistHipRatio(waistCm: number, hipCm: number): number | null {
  if (waistCm <= 0 || hipCm <= 0) return null;
  return Math.round((waistCm / hipCm) * 100) / 100;
}

export function fatMassKg(weightKg: number, bodyFatPct: number): number | null {
  if (weightKg <= 0 || bodyFatPct <= 0 || bodyFatPct >= 100) return null;
  return Math.round(weightKg * bodyFatPct) / 100;
}

export function leanMassKg(
  weightKg: number,
  bodyFatPct: number,
): number | null {
  const fat = fatMassKg(weightKg, bodyFatPct);
  if (fat == null) return null;
  return Math.round((weightKg - fat) * 10) / 10;
}
