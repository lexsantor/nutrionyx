/**
 * The parts of a meal mark that both sides of the client boundary need.
 *
 * Separate from `meal-log.ts` because that module imports Prisma, and a
 * `"use client"` component importing a value from it would drag the database
 * client into the browser bundle - the same class of trap as the constant
 * shared with a server action in tasks/lessons.md, from the other direction.
 */

import type { MealStatus } from "@/generated/prisma/client";
import type { MealSlot } from "./plan";

export type { MealStatus };

export type MealMark = { status: MealStatus; note: string | null };

export type DayLog = Partial<Record<MealSlot, MealMark>>;

/** Longest note a patient can attach to a meal. */
export const MEAL_NOTE_MAX = 280;

/**
 * A note explains a divergence, so only a divergence carries one. Marking a
 * meal done again clears it: keeping "cené fuera" on a meal now marked as
 * eaten as prescribed would put a contradiction in a clinical record.
 *
 * One list, read by both the UI predicate and the repository's query filter,
 * because the same rule written twice is a rule that drifts.
 */
export const NOTE_STATUSES = [
  "CHANGED",
  "SKIPPED",
] as const satisfies readonly MealStatus[];

export function keepsNote(status: MealStatus | null): boolean {
  return status != null && (NOTE_STATUSES as readonly string[]).includes(status);
}
