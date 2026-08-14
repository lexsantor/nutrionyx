import { describe, expect, it } from "vitest";
import {
  ACTIVITY_FACTORS,
  estimateEnergy,
  katchMcArdle,
  mifflinStJeor,
} from "./energy";

describe("mifflinStJeor", () => {
  it("matches the published equation for a man", () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5
    expect(
      mifflinStJeor({ sex: "MALE", weightKg: 80, heightCm: 180, ageYears: 30 }),
    ).toBe(1780);
  });

  it("matches the published equation for a woman", () => {
    // 10*65 + 6.25*165 - 5*35 - 161 = 650 + 1031.25 - 175 - 161
    expect(
      mifflinStJeor({ sex: "FEMALE", weightKg: 65, heightCm: 165, ageYears: 35 }),
    ).toBe(1345);
  });

  it("refuses impossible inputs instead of returning a number", () => {
    expect(
      mifflinStJeor({ sex: "MALE", weightKg: 0, heightCm: 180, ageYears: 30 }),
    ).toBeNull();
    expect(
      mifflinStJeor({ sex: "MALE", weightKg: 80, heightCm: -1, ageYears: 30 }),
    ).toBeNull();
    expect(
      mifflinStJeor({ sex: "MALE", weightKg: 80, heightCm: 180, ageYears: -1 }),
    ).toBeNull();
  });
});

describe("katchMcArdle", () => {
  it("reads lean mass alone", () => {
    // 370 + 21.6*60 = 370 + 1296
    expect(katchMcArdle(60)).toBe(1666);
  });

  it("refuses a non-positive lean mass", () => {
    expect(katchMcArdle(0)).toBeNull();
    expect(katchMcArdle(-5)).toBeNull();
  });
});

describe("estimateEnergy", () => {
  const base = {
    sex: "MALE" as const,
    weightKg: 80,
    heightCm: 180,
    ageYears: 30,
    activityLevel: "MEDIUM" as const,
  };

  it("applies the activity factor to the BMR", () => {
    const e = estimateEnergy(base);
    expect(e).not.toBeNull();
    expect(e!.basis).toBe("mifflin");
    expect(e!.bmr).toBe(1780);
    expect(e!.activityFactor).toBe(ACTIVITY_FACTORS.MEDIUM);
    expect(e!.maintenanceKcal).toBe(Math.round(1780 * 1.55));
  });

  it("prefers lean mass over height and sex when it is known", () => {
    const e = estimateEnergy({ ...base, leanMassKg: 60 });
    expect(e!.basis).toBe("katch");
    expect(e!.bmr).toBe(1666);
  });

  it("falls back to Mifflin when the body-fat reading is missing or unusable", () => {
    expect(estimateEnergy({ ...base, leanMassKg: null })!.basis).toBe("mifflin");
    expect(estimateEnergy({ ...base, leanMassKg: 0 })!.basis).toBe("mifflin");
  });

  // A suggestion built on a guessed input is worse than no suggestion.
  it("returns null rather than inventing a figure", () => {
    expect(estimateEnergy({ ...base, activityLevel: null })).toBeNull();
    expect(estimateEnergy({ ...base, sex: null })).toBeNull();
    expect(estimateEnergy({ ...base, weightKg: null })).toBeNull();
    expect(estimateEnergy({ ...base, heightCm: null })).toBeNull();
    expect(estimateEnergy({ ...base, ageYears: null })).toBeNull();
  });

  // Lean mass makes sex and height irrelevant, so it must still answer.
  it("answers from lean mass alone when the rest is missing", () => {
    const e = estimateEnergy({
      sex: null,
      weightKg: null,
      heightCm: null,
      ageYears: null,
      activityLevel: "HIGH",
      leanMassKg: 55,
    });
    expect(e!.basis).toBe("katch");
    expect(e!.maintenanceKcal).toBe(Math.round(katchMcArdle(55)! * 1.725));
  });

  // A body-fat percentage is the easiest field to typo, and Katch-McArdle
  // amplifies it: 5% on a 124 kg patient is a BMR no human has.
  it("refuses a basal rate no person could have", () => {
    expect(estimateEnergy({ ...base, leanMassKg: 400 })!.basis).toBe("mifflin");
    expect(
      estimateEnergy({
        sex: null,
        weightKg: null,
        heightCm: null,
        ageYears: null,
        activityLevel: "LOW",
        leanMassKg: 400,
      }),
    ).toBeNull();
    expect(
      estimateEnergy({ ...base, weightKg: 5, heightCm: 40, ageYears: 1 }),
    ).toBeNull();
  });

  it("keeps the three-level activity scale ordered", () => {
    expect(ACTIVITY_FACTORS.LOW).toBeLessThan(ACTIVITY_FACTORS.MEDIUM);
    expect(ACTIVITY_FACTORS.MEDIUM).toBeLessThan(ACTIVITY_FACTORS.HIGH);
  });
});
