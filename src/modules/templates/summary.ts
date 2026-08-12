import {
  MEAL_SLOTS,
  normalizeContent,
  type DietPlanContent,
} from "@/modules/diet/plan";
import { normalizeRoutine, type RoutineContent } from "@/modules/training/routine";

/**
 * What a saved week contains, at a glance (docs/build/navigation-audit.md,
 * tier 1). A template list that shows only names makes the specialist open
 * every one to tell them apart; two counts is enough to recognise a week
 * you wrote yourself.
 *
 * Content arrives from the database as untrusted JSON, so both readers
 * normalize first and report an unreadable document rather than guessing.
 */
export type WeekSummary = {
  days: number;
  items: number;
  /** The stored JSON did not survive normalization. */
  broken: boolean;
};

const BROKEN: WeekSummary = { days: 0, items: 0, broken: true };

export function summarizeDietWeek(input: unknown): WeekSummary {
  const content = normalizeContent(input) as DietPlanContent | null;
  if (!content) return BROKEN;

  let days = 0;
  let items = 0;
  for (const day of content.days) {
    let inDay = 0;
    for (const slot of MEAL_SLOTS) {
      const meal = day[slot];
      if (!meal) continue;
      // Alternatives are variants of the same meal, not extra food to
      // shop for, so the count follows the main rows only.
      inDay += meal.main.length;
    }
    if (inDay > 0) days += 1;
    items += inDay;
  }
  return { days, items, broken: false };
}

export function summarizeRoutineWeek(input: unknown): WeekSummary {
  const content = normalizeRoutine(input) as RoutineContent | null;
  if (!content) return BROKEN;

  let days = 0;
  let items = 0;
  for (const day of content.days) {
    if (day.exercises.length > 0) days += 1;
    items += day.exercises.length;
  }
  return { days, items, broken: false };
}
