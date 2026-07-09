/**
 * Computed values of the Assessment aggregate (docs/09_Domain_Model.md).
 * Pure functions: no IO, fully unit-tested (LPEF EN2).
 */

export function bmi(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new RangeError("weightKg and heightCm must be positive");
  }
  const heightM = heightCm / 100;
  return round1(weightKg / (heightM * heightM));
}

export type BmiCategory =
  | "underweight"
  | "normal"
  | "overweight"
  | "obesity";

/** WHO adult cut-offs. */
export function bmiCategory(value: number): BmiCategory {
  if (value < 18.5) return "underweight";
  if (value < 25) return "normal";
  if (value < 30) return "overweight";
  return "obesity";
}

/**
 * Fraction of current weight the target implies losing.
 * Negative when the target is above current weight (gain).
 */
export function targetDeltaRatio(
  currentWeightKg: number,
  targetWeightKg: number,
): number {
  if (currentWeightKg <= 0 || targetWeightKg <= 0) {
    throw new RangeError("weights must be positive");
  }
  return (currentWeightKg - targetWeightKg) / currentWeightKg;
}

export type LossTier = "info" | "healthy" | "aggressive";

/**
 * Capture-time guardrail tiers (blue/green/orange in the UI).
 * PROVISIONAL thresholds pending clinical confirmation by the owner
 * (tracked in tasks/todo.md): <5% or gain = info; 5-15% = healthy
 * (literature: ~10% loss yields measurable health benefits);
 * >15% = aggressive, requires professional supervision messaging.
 */
export const LOSS_TIER_THRESHOLDS = { healthyMin: 0.05, aggressiveMin: 0.15 } as const;

export function lossTier(ratio: number): LossTier {
  if (ratio < LOSS_TIER_THRESHOLDS.healthyMin) return "info";
  if (ratio < LOSS_TIER_THRESHOLDS.aggressiveMin) return "healthy";
  return "aggressive";
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
