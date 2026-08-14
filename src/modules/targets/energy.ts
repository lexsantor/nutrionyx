/**
 * Energy expenditure estimates for the kcal target (roadmap 2026-08-14, Tier 1).
 * Pure functions, no IO, unit-tested (LPEF EN2).
 *
 * What this is for: `PatientTarget.kcalTarget` was typed from nothing, while
 * the Assessment has held sex, birth date, height, weight and activity level
 * since slice 1. This turns those into a starting figure the specialist can
 * accept or overwrite.
 *
 * **It estimates maintenance, and stops there.** No deficit, no surplus, no
 * adjustment towards the target weight: how far to move someone from
 * maintenance is a clinical decision and Nutrionyx does not prescribe. The
 * same rule as the medication module.
 */

import type { ActivityLevel, Sex } from "@/generated/prisma/client";

/**
 * The literature's activity multipliers are a five-level scale (sedentary
 * 1.2, light 1.375, moderate 1.55, very 1.725, extra 1.9) and the domain's
 * `ActivityLevel` is three. This mapping is therefore an interpretation, not
 * a lookup: LOW is sedentary, MEDIUM is moderate, HIGH is very active, and
 * the extremes of the five-level scale are unreachable. Deliberate - a
 * specialist who needs 1.9 overwrites the figure, which they can always do.
 */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  LOW: 1.2,
  MEDIUM: 1.55,
  HIGH: 1.725,
};

/** Which equation produced a BMR. Shown in the UI: the specialist should know. */
export type EnergyBasis = "mifflin" | "katch";

export type EnergyEstimate = {
  /** Basal metabolic rate, kcal/day. */
  bmr: number;
  /** BMR x activity factor: what this person burns at a stable weight. */
  maintenanceKcal: number;
  basis: EnergyBasis;
  activityFactor: number;
};

const isPositive = (n: number | null | undefined): n is number =>
  typeof n === "number" && Number.isFinite(n) && n > 0;

/**
 * A basal rate outside this band did not come from a person: it came from a
 * typo, most likely a body-fat percentage. Guarding the output rather than
 * each input catches every bad path at once, and the product of a typo is
 * exactly the kind of confidently-wrong figure this whole module exists to
 * avoid - so out of band means no suggestion, not a suspicious one.
 */
export const PLAUSIBLE_BMR = { min: 800, max: 4000 } as const;

const plausible = (bmr: number | null): bmr is number =>
  bmr != null && bmr >= PLAUSIBLE_BMR.min && bmr <= PLAUSIBLE_BMR.max;

/**
 * Mifflin-St Jeor (1990). The default when body composition is unknown, and
 * the equation with the least error across a general adult population.
 */
export function mifflinStJeor(params: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}): number | null {
  const { sex, weightKg, heightCm, ageYears } = params;
  if (!isPositive(weightKg) || !isPositive(heightCm) || ageYears < 0) {
    return null;
  }
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return Math.round(base + (sex === "MALE" ? 5 : -161));
}

/**
 * Katch-McArdle (1996). Preferred when lean mass is known, because it does
 * not care about sex or height: it reads the tissue that actually burns.
 */
export function katchMcArdle(leanMassKg: number): number | null {
  if (!isPositive(leanMassKg)) return null;
  return Math.round(370 + 21.6 * leanMassKg);
}

/**
 * The figure to offer, or null when the inputs do not support one. Null is
 * the point: a suggestion built on a guessed input is worse than no
 * suggestion, so every caller renders nothing rather than a made-up number.
 */
export function estimateEnergy(input: {
  sex: Sex | null;
  weightKg: number | null;
  heightCm: number | null;
  ageYears: number | null;
  activityLevel: ActivityLevel | null;
  /** From the latest body-fat reading, when there is one. */
  leanMassKg?: number | null;
}): EnergyEstimate | null {
  const { sex, weightKg, heightCm, ageYears, activityLevel, leanMassKg } = input;
  if (activityLevel == null) return null;
  const activityFactor = ACTIVITY_FACTORS[activityLevel];

  // Lean mass wins when it exists: it is measured, not inferred from height.
  const katch = isPositive(leanMassKg) ? katchMcArdle(leanMassKg) : null;
  if (plausible(katch)) {
    return {
      bmr: katch,
      maintenanceKcal: Math.round(katch * activityFactor),
      basis: "katch",
      activityFactor,
    };
  }

  if (sex == null || !isPositive(weightKg) || !isPositive(heightCm)) return null;
  if (ageYears == null || ageYears < 0) return null;

  const mifflin = mifflinStJeor({ sex, weightKg, heightCm, ageYears });
  if (!plausible(mifflin)) return null;
  return {
    bmr: mifflin,
    maintenanceKcal: Math.round(mifflin * activityFactor),
    basis: "mifflin",
    activityFactor,
  };
}
