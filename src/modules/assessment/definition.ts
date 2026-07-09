/**
 * Assessment wizard definition: ordered steps, field types, validation.
 * Domain source: docs/09_Domain_Model.md (core clinical intake).
 * Pure module - no IO, fully unit-tested (LPEF EN2).
 */

export const GOAL_IDS = [
  "lose-weight",
  "gain-muscle",
  "improve-health",
  "more-energy",
  "better-habits",
  "joint-health",
  "gut-health",
  "reduce-cravings",
] as const;
export type GoalId = (typeof GOAL_IDS)[number];

export const ACTIVITY_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export const SEXES = ["FEMALE", "MALE"] as const;

/** Wizard steps in presentation order. One question per screen. */
export const ASSESSMENT_STEPS = [
  { field: "sex", kind: "single", required: true },
  { field: "birthDate", kind: "date", required: true },
  { field: "heightCm", kind: "number", required: true },
  { field: "weightKg", kind: "number", required: true },
  { field: "targetWeightKg", kind: "number", required: true },
  { field: "activityLevel", kind: "single", required: true },
  { field: "goals", kind: "multi", required: true },
  { field: "conditions", kind: "text", required: false },
  { field: "allergies", kind: "text", required: false },
  { field: "currentMedication", kind: "text", required: false },
] as const;

export type AssessmentField = (typeof ASSESSMENT_STEPS)[number]["field"];

export const REQUIRED_FIELDS: AssessmentField[] = ASSESSMENT_STEPS.filter(
  (s) => s.required,
).map((s) => s.field);

// Technical plausibility bounds, not clinical judgment. The minimum age
// floor (16) is provisional and flagged for owner confirmation
// (tasks/todo.md), like the guardrail thresholds in computed.ts.
export const BOUNDS = {
  heightCm: { min: 80, max: 250 },
  weightKg: { min: 20, max: 350 },
  targetWeightKg: { min: 20, max: 350 },
  ageYears: { min: 16, max: 120 },
  textMax: 2000,
} as const;

export type ValidationResult =
  | { ok: true; value: string | number | string[] }
  | { ok: false; errorKey: string };

export function validateAnswer(
  field: AssessmentField,
  raw: unknown,
  today: Date = new Date(),
): ValidationResult {
  switch (field) {
    case "sex": {
      return typeof raw === "string" && (SEXES as readonly string[]).includes(raw)
        ? { ok: true, value: raw }
        : { ok: false, errorKey: "invalidOption" };
    }
    case "activityLevel": {
      return typeof raw === "string" &&
        (ACTIVITY_LEVELS as readonly string[]).includes(raw)
        ? { ok: true, value: raw }
        : { ok: false, errorKey: "invalidOption" };
    }
    case "birthDate": {
      if (typeof raw !== "string") return { ok: false, errorKey: "invalidDate" };
      const date = new Date(`${raw}T00:00:00Z`);
      if (Number.isNaN(date.getTime())) {
        return { ok: false, errorKey: "invalidDate" };
      }
      const age =
        (today.getTime() - date.getTime()) / (365.25 * 24 * 3600 * 1000);
      if (age < BOUNDS.ageYears.min) return { ok: false, errorKey: "tooYoung" };
      if (age > BOUNDS.ageYears.max) return { ok: false, errorKey: "invalidDate" };
      return { ok: true, value: raw };
    }
    case "heightCm":
    case "weightKg":
    case "targetWeightKg": {
      const n = typeof raw === "string" ? Number(raw.replace(",", ".")) : NaN;
      if (!Number.isFinite(n)) return { ok: false, errorKey: "invalidNumber" };
      const bounds = BOUNDS[field];
      if (n < bounds.min || n > bounds.max) {
        return { ok: false, errorKey: "outOfRange" };
      }
      return { ok: true, value: Math.round(n * 10) / 10 };
    }
    case "goals": {
      const values = Array.isArray(raw) ? raw : [];
      const valid = values.filter(
        (v): v is GoalId =>
          typeof v === "string" && (GOAL_IDS as readonly string[]).includes(v),
      );
      if (valid.length === 0) return { ok: false, errorKey: "selectAtLeastOne" };
      return { ok: true, value: valid };
    }
    case "conditions":
    case "allergies":
    case "currentMedication": {
      const text = typeof raw === "string" ? raw.trim() : "";
      if (text.length > BOUNDS.textMax) {
        return { ok: false, errorKey: "tooLong" };
      }
      // Optional fields: empty is a valid, explicit "none".
      return { ok: true, value: text };
    }
  }
}

/** Fields still missing before the assessment can be completed. */
export function missingRequiredFields(
  data: Partial<Record<AssessmentField, unknown>>,
): AssessmentField[] {
  return REQUIRED_FIELDS.filter((field) => {
    const value = data[field];
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    return String(value).length === 0;
  });
}

/** First unanswered step - where a resumed wizard should land. */
export function firstUnansweredStep(
  data: Partial<Record<AssessmentField, unknown>>,
): number {
  const index = ASSESSMENT_STEPS.findIndex((step) => {
    const value = data[step.field];
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    return false;
  });
  return index === -1 ? ASSESSMENT_STEPS.length : index;
}
