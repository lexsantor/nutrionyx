import { describe, expect, it } from "vitest";
import {
  DAYS_PER_WEEK,
  EXERCISES_PER_DAY_MAX,
  EXERCISE_NAME_MAX,
  REPS_MAX,
  SETS_MAX,
  emptyRoutine,
  formatPrescription,
  isEmptyRoutine,
  normalizeRoutine,
  routineFromEntries,
} from "./routine";

/** A 7-day skeleton with `day0` as Monday. */
function week(day0: unknown): unknown {
  return {
    days: [
      day0,
      ...Array.from({ length: DAYS_PER_WEEK - 1 }, () => ({ exercises: [] })),
    ],
  };
}

describe("normalizeRoutine", () => {
  it("rejects shapes that are not a 7-day week", () => {
    expect(normalizeRoutine(null)).toBeNull();
    expect(normalizeRoutine({ days: [] })).toBeNull();
    expect(normalizeRoutine({ days: Array(6).fill({ exercises: [] }) })).toBeNull();
  });

  it("keeps exercises with series and repetitions, trimmed", () => {
    const result = normalizeRoutine(
      week({
        exercises: [
          { name: " Sentadilla ", sets: " 4 ", reps: " 12 " },
          { name: "Press banca", sets: "3-4", reps: "al fallo" },
        ],
      }),
    );
    expect(result?.version).toBe(2);
    expect(result?.days[0].exercises).toEqual([
      { name: "Sentadilla", sets: "4", reps: "12" },
      { name: "Press banca", sets: "3-4", reps: "al fallo" },
    ]);
  });

  it("drops rows with no exercise name", () => {
    const result = normalizeRoutine(
      week({ exercises: [{ name: "  ", sets: "4", reps: "12" }] }),
    );
    expect(result?.days[0].exercises).toEqual([]);
  });

  it("keeps optional notes and imageKey only when present", () => {
    const result = normalizeRoutine(
      week({
        exercises: [
          { name: "Remo", sets: "4", reps: "10", notes: "Espalda recta", imageKey: "remo" },
          { name: "Zancada", sets: "3", reps: "12", notes: "", imageKey: "" },
        ],
      }),
    );
    expect(result?.days[0].exercises[0]).toEqual({
      name: "Remo",
      sets: "4",
      reps: "10",
      notes: "Espalda recta",
      imageKey: "remo",
    });
    expect(result?.days[0].exercises[1]).toEqual({
      name: "Zancada",
      sets: "3",
      reps: "12",
    });
  });

  it("rejects input past the caps instead of truncating", () => {
    expect(
      normalizeRoutine(
        week({ exercises: [{ name: "x".repeat(EXERCISE_NAME_MAX + 1), sets: "", reps: "" }] }),
      ),
    ).toBeNull();
    expect(
      normalizeRoutine(
        week({ exercises: [{ name: "Remo", sets: "x".repeat(SETS_MAX + 1), reps: "" }] }),
      ),
    ).toBeNull();
    expect(
      normalizeRoutine(
        week({ exercises: [{ name: "Remo", sets: "", reps: "x".repeat(REPS_MAX + 1) }] }),
      ),
    ).toBeNull();
    const tooMany = Array.from({ length: EXERCISES_PER_DAY_MAX + 1 }, () => ({
      name: "Remo",
      sets: "",
      reps: "",
    }));
    expect(normalizeRoutine(week({ exercises: tooMany }))).toBeNull();
  });

  it("lifts a v1 string day into one exercise", () => {
    const result = normalizeRoutine(week("Pecho y tríceps: press banca 4x10"));
    expect(result?.days[0].exercises).toEqual([
      { name: "Pecho y tríceps: press banca 4x10", sets: "", reps: "" },
    ]);
  });

  it("treats a blank v1 day as a rest day", () => {
    expect(normalizeRoutine(week(""))?.days[0].exercises).toEqual([]);
  });

  it("round-trips its own output", () => {
    const once = normalizeRoutine(
      week({ exercises: [{ name: "Peso muerto", sets: "5", reps: "5" }] }),
    );
    expect(normalizeRoutine(once)).toEqual(once);
  });
});

describe("isEmptyRoutine", () => {
  it("is true for a fresh routine and false once an exercise exists", () => {
    expect(isEmptyRoutine(emptyRoutine())).toBe(true);
    const filled = normalizeRoutine(
      week({ exercises: [{ name: "Dominadas", sets: "4", reps: "8" }] }),
    )!;
    expect(isEmptyRoutine(filled)).toBe(false);
  });
});

describe("formatPrescription", () => {
  it("joins series and reps, or falls back to whichever exists", () => {
    expect(formatPrescription({ name: "x", sets: "4", reps: "12" })).toBe("4 × 12");
    expect(formatPrescription({ name: "x", sets: "4", reps: "" })).toBe("4");
    expect(formatPrescription({ name: "x", sets: "", reps: "12" })).toBe("12");
    expect(formatPrescription({ name: "x", sets: "", reps: "" })).toBe("");
  });
});

describe("routineFromEntries", () => {
  const field = (
    day: number,
    row: number,
    part: string,
    value: string,
  ): [string, string] => [`ex-${day}-${row}-${part}`, value];

  it("rebuilds exercises in the order the editor rendered them", () => {
    const content = normalizeRoutine(
      routineFromEntries([
        field(0, 1, "name", "Press banca"),
        field(0, 1, "sets", "3"),
        field(0, 1, "reps", "10"),
        field(0, 0, "name", "Sentadilla"),
        field(0, 0, "sets", "4"),
        field(0, 0, "reps", "12"),
      ]),
    );
    expect(content?.days[0].exercises).toEqual([
      { name: "Sentadilla", sets: "4", reps: "12" },
      { name: "Press banca", sets: "3", reps: "10" },
    ]);
  });

  it("ignores unrelated fields and out-of-range days", () => {
    const content = normalizeRoutine(
      routineFromEntries([
        ["title", "Rutina de fuerza"],
        field(9, 0, "name", "Fuera de rango"),
        field(2, 0, "name", "Remo"),
        field(2, 0, "sets", "4"),
        field(2, 0, "reps", "10"),
      ]),
    );
    expect(content?.days[2].exercises).toEqual([
      { name: "Remo", sets: "4", reps: "10" },
    ]);
    expect(content?.days[0].exercises).toEqual([]);
  });

  it("produces a valid empty week when nothing was filled in", () => {
    const content = normalizeRoutine(
      routineFromEntries([
        field(0, 0, "name", ""),
        field(0, 0, "sets", ""),
        field(0, 0, "reps", ""),
      ]),
    );
    expect(content).not.toBeNull();
    expect(isEmptyRoutine(content!)).toBe(true);
  });
});
