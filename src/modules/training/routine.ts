import { findExercise } from "./exercises";

/**
 * Training-routine document (docs/build/slice-18-plan.md, restructured in
 * slice-21C). Pure validation, same idea as diet/plan.ts.
 *
 * v2 gives each day a list of exercises with series and repetitions. The
 * exercise itself comes from the catalogue in ./exercises: `key` is the
 * identity, `name` its resolved label. v1 stored one free-text string per
 * day; normalizeRoutine still accepts it and lifts it into a single
 * keyless exercise, so routines written before this slice keep rendering
 * and upgrade the first time they are saved. A day with no exercises is a
 * rest day.
 */
export const DAYS_PER_WEEK = 7;
export const EXERCISE_NAME_MAX = 120;
export const SETS_MAX = 12;
export const REPS_MAX = 24;
export const NOTES_MAX = 300;
export const EXERCISES_PER_DAY_MAX = 20;

/**
 * `sets` and `reps` are free text ("4", "3-4", "12 por lado", "al fallo"):
 * prescriptions are never arithmetic here, and a numeric field would
 * reject half of how routines are actually written.
 */
export type Exercise = {
  /**
   * Catalogue slug (./exercises). Absent on v1 rows written before the
   * catalogue existed, which keep their free-text `name` instead.
   */
  key?: string;
  /** Resolved from the catalogue when `key` is set; free text otherwise. */
  name: string;
  sets: string;
  reps: string;
  notes?: string;
};

export type RoutineContent = { version: 2; days: { exercises: Exercise[] }[] };

export function emptyRoutine(): RoutineContent {
  return {
    version: 2,
    days: Array.from({ length: DAYS_PER_WEEK }, () => ({ exercises: [] })),
  };
}

export function blankExercise(): Exercise {
  return { name: "", sets: "", reps: "" };
}

/**
 * `undefined` means "blank row, drop it"; `null` means "invalid, reject
 * the document". Collapsing the two would silently discard input that
 * breached a cap.
 */
type ExerciseResult = Exercise | undefined | null;

function normalizeExercise(input: unknown): ExerciseResult {
  if (typeof input !== "object" || input === null) return null;
  const raw = input as Record<string, unknown>;

  const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const sets = str(raw.sets);
  const reps = str(raw.reps);
  const notes = str(raw.notes);

  // A key that no longer resolves is dead weight: drop it and let the
  // stored name carry the row, rather than keeping a dangling reference
  // (or whatever string a tampered post supplied).
  const catalogue = findExercise(str(raw.key));
  const name = catalogue?.name ?? str(raw.name);

  if (
    name.length > EXERCISE_NAME_MAX ||
    sets.length > SETS_MAX ||
    reps.length > REPS_MAX ||
    notes.length > NOTES_MAX
  ) {
    return null;
  }

  // The exercise is what carries the row; sets/reps without it name
  // nothing.
  if (!name) return undefined;

  const exercise: Exercise = { name, sets, reps };
  if (catalogue) exercise.key = catalogue.key;
  if (notes) exercise.notes = notes;
  return exercise;
}

/** v1 day (a single string) lifted into one v2 exercise. */
function liftLegacyDay(text: string): { exercises: Exercise[] } {
  const name = text.trim();
  if (!name) return { exercises: [] };
  return {
    exercises: [
      { name: name.slice(0, EXERCISE_NAME_MAX), sets: "", reps: "" },
    ],
  };
}

/** Normalize untrusted content; null when not salvageable. */
export function normalizeRoutine(input: unknown): RoutineContent | null {
  if (typeof input !== "object" || input === null) return null;
  const days = (input as { days?: unknown }).days;
  if (!Array.isArray(days) || days.length !== DAYS_PER_WEEK) return null;

  const normalized: RoutineContent = { version: 2, days: [] };
  for (const day of days) {
    // v1: the day held a plain string.
    if (typeof day === "string") {
      normalized.days.push(liftLegacyDay(day));
      continue;
    }
    if (typeof day !== "object" || day === null) return null;

    const rawExercises = (day as { exercises?: unknown }).exercises;
    if (rawExercises === undefined) {
      normalized.days.push({ exercises: [] });
      continue;
    }
    if (!Array.isArray(rawExercises)) return null;
    if (rawExercises.length > EXERCISES_PER_DAY_MAX) return null;

    const exercises: Exercise[] = [];
    for (const item of rawExercises) {
      const exercise = normalizeExercise(item);
      if (exercise === null) return null;
      if (exercise) exercises.push(exercise);
    }
    normalized.days.push({ exercises });
  }
  return normalized;
}

export function isEmptyRoutine(content: RoutineContent): boolean {
  return content.days.every((day) => day.exercises.length === 0);
}

/** "4 × 12" for a prescription, or whichever half was filled in. */
export function formatPrescription(exercise: Exercise): string {
  if (exercise.sets && exercise.reps) return `${exercise.sets} × ${exercise.reps}`;
  return exercise.sets || exercise.reps || "";
}

/**
 * Rebuild a week from posted editor fields, mirroring diet's helper:
 *
 *   ex-{day}-{row}-{key|name|sets|reps|notes}
 *
 * Returns raw content: pass it through normalizeRoutine, which enforces
 * every cap, resolves the catalogue key and drops blank rows.
 */
export function routineFromEntries(
  entries: Iterable<[string, string]>,
): unknown {
  const FIELD = /^ex-(\d+)-(\d+)-(key|name|sets|reps|notes)$/;
  const cells = new Map<string, Record<string, string>>();

  for (const [key, value] of entries) {
    const match = key.match(FIELD);
    if (!match) continue;
    const [, day, row, field] = match;
    const id = `${day}|${row}`;
    const cell = cells.get(id) ?? {};
    cell[field] = value;
    cells.set(id, cell);
  }

  const days: { exercises: Record<string, string>[] }[] = Array.from(
    { length: DAYS_PER_WEEK },
    () => ({ exercises: [] }),
  );

  const sorted = [...cells.entries()].sort((a, b) => {
    const [dayA, rowA] = a[0].split("|");
    const [dayB, rowB] = b[0].split("|");
    return Number(dayA) - Number(dayB) || Number(rowA) - Number(rowB);
  });

  for (const [id, cell] of sorted) {
    const day = Number(id.split("|")[0]);
    if (!Number.isInteger(day) || day < 0 || day >= DAYS_PER_WEEK) continue;
    days[day].exercises.push(cell);
  }

  return { days };
}
