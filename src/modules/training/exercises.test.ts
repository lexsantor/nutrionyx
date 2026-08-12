import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  EXERCISES,
  ILLUSTRATED,
  exerciseImage,
  exercisesByGroup,
  findExercise,
} from "./exercises";
import { EXERCISE_NAME_MAX } from "./routine";

describe("exercise catalogue", () => {
  it("has unique keys", () => {
    const keys = EXERCISES.map((exercise) => exercise.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("keeps every name within the routine's name cap", () => {
    for (const exercise of EXERCISES) {
      expect(exercise.name.length).toBeLessThanOrEqual(EXERCISE_NAME_MAX);
    }
  });

  it("only marks catalogue entries as illustrated", () => {
    for (const key of ILLUSTRATED) {
      expect(findExercise(key)).toBeDefined();
    }
  });

  it("has a real file behind every illustrated key", () => {
    // The set is hand-maintained: a key added before its file exists
    // would ship a broken image into the editor.
    for (const key of ILLUSTRATED) {
      const path = exerciseImage(key)!;
      expect(existsSync(`public${path}`), path).toBe(true);
    }
  });

  it("returns no image path for an exercise without one", () => {
    const withoutImage = EXERCISES.find((e) => !ILLUSTRATED.has(e.key));
    expect(exerciseImage(withoutImage!.key)).toBeNull();
    expect(exerciseImage("inventado")).toBeNull();
  });

  it("groups every exercise exactly once, in catalogue order", () => {
    const grouped = exercisesByGroup().flatMap((entry) => entry.exercises);
    expect(grouped).toHaveLength(EXERCISES.length);
    expect(new Set(grouped.map((e) => e.key)).size).toBe(EXERCISES.length);
  });
});
