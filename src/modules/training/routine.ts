/**
 * Training-routine document (docs/build/slice-18-plan.md, restructured in
 * slice-21C). Pure validation, same idea as diet/plan.ts.
 *
 * v2 gives each day a list of exercises with series, repetitions and an
 * optional illustration key. v1 stored one free-text string per day;
 * normalizeRoutine still accepts it and lifts it into a single exercise,
 * so routines written before this slice keep rendering and upgrade the
 * first time they are saved. A day with no exercises is a rest day.
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
  name: string;
  sets: string;
  reps: string;
  notes?: string;
  /** Slug into the illustration catalogue; unknown slugs render no image. */
  imageKey?: string;
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
  const name = str(raw.name);
  const sets = str(raw.sets);
  const reps = str(raw.reps);
  const notes = str(raw.notes);
  const imageKey = str(raw.imageKey);

  if (
    name.length > EXERCISE_NAME_MAX ||
    sets.length > SETS_MAX ||
    reps.length > REPS_MAX ||
    notes.length > NOTES_MAX
  ) {
    return null;
  }

  // The exercise name is what carries the row; sets/reps without it name
  // nothing.
  if (!name) return undefined;

  const exercise: Exercise = { name, sets, reps };
  if (notes) exercise.notes = notes;
  if (imageKey) exercise.imageKey = imageKey;
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
 *   ex-{day}-{row}-{name|sets|reps|notes|imageKey}
 *
 * Returns raw content: pass it through normalizeRoutine, which enforces
 * every cap and drops blank rows.
 */
export function routineFromEntries(
  entries: Iterable<[string, string]>,
): unknown {
  const FIELD = /^ex-(\d+)-(\d+)-(name|sets|reps|notes|imageKey)$/;
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
