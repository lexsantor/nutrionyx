/**
 * Diet-plan document shape and validation (docs/build/slice-17-plan.md).
 * Pure: the repository stores whatever this normalizes.
 */
export const MEAL_SLOTS = [
  "BREAKFAST",
  "MID_MORNING",
  "LUNCH",
  "SNACK",
  "DINNER",
] as const;

export type MealSlot = (typeof MEAL_SLOTS)[number];

/** 7 days (Monday-first), each a partial slot -> text map. */
export type DietPlanContent = {
  days: Partial<Record<MealSlot, string>>[];
};

export const DAYS_PER_WEEK = 7;
export const MEAL_TEXT_MAX = 1000;

export function emptyContent(): DietPlanContent {
  return { days: Array.from({ length: DAYS_PER_WEEK }, () => ({})) };
}

/**
 * Normalize untrusted content: exactly 7 days, known slots only, trimmed
 * strings, empty meals dropped, length capped. Returns null when the shape
 * is not salvageable.
 */
export function normalizeContent(input: unknown): DietPlanContent | null {
  if (typeof input !== "object" || input === null) return null;
  const days = (input as { days?: unknown }).days;
  if (!Array.isArray(days) || days.length !== DAYS_PER_WEEK) return null;

  const normalized: DietPlanContent = { days: [] };
  for (const day of days) {
    const out: Partial<Record<MealSlot, string>> = {};
    if (typeof day === "object" && day !== null) {
      for (const slot of MEAL_SLOTS) {
        const value = (day as Record<string, unknown>)[slot];
        if (typeof value !== "string") continue;
        const text = value.trim();
        if (!text) continue;
        if (text.length > MEAL_TEXT_MAX) return null;
        out[slot] = text;
      }
    }
    normalized.days.push(out);
  }
  return normalized;
}

/** True when no meal has content. */
export function isEmptyPlan(content: DietPlanContent): boolean {
  return content.days.every((day) => Object.keys(day).length === 0);
}
