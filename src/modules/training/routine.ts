/**
 * Training-routine document (docs/build/slice-18-plan.md). 7 day-texts,
 * empty string = rest day. Pure validation, same idea as diet/plan.ts.
 */
export const DAYS_PER_WEEK = 7;
export const DAY_TEXT_MAX = 2000;

export type RoutineContent = { days: string[] };

export function emptyRoutine(): RoutineContent {
  return { days: Array.from({ length: DAYS_PER_WEEK }, () => "") };
}

/** Normalize untrusted content; null when not salvageable. */
export function normalizeRoutine(input: unknown): RoutineContent | null {
  if (typeof input !== "object" || input === null) return null;
  const days = (input as { days?: unknown }).days;
  if (!Array.isArray(days) || days.length !== DAYS_PER_WEEK) return null;
  const normalized: string[] = [];
  for (const day of days) {
    if (typeof day !== "string") return null;
    const text = day.trim();
    if (text.length > DAY_TEXT_MAX) return null;
    normalized.push(text);
  }
  return { days: normalized };
}

export function isEmptyRoutine(content: RoutineContent): boolean {
  return content.days.every((day) => day === "");
}
