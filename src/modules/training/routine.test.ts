import { describe, expect, it } from "vitest";
import {
  DAY_TEXT_MAX,
  emptyRoutine,
  isEmptyRoutine,
  normalizeRoutine,
} from "./routine";

describe("training routine content", () => {
  it("empty routine: 7 rest days", () => {
    const r = emptyRoutine();
    expect(r.days.length).toBe(7);
    expect(isEmptyRoutine(r)).toBe(true);
  });

  it("normalizes: trims day texts", () => {
    const r = emptyRoutine();
    r.days[0] = "  Sentadilla 4x8 · Press banca 3x10  ";
    const n = normalizeRoutine(r)!;
    expect(n.days[0]).toBe("Sentadilla 4x8 · Press banca 3x10");
    expect(isEmptyRoutine(n)).toBe(false);
  });

  it("rejects wrong shapes and oversized days", () => {
    expect(normalizeRoutine(null)).toBeNull();
    expect(normalizeRoutine({ days: ["a"] })).toBeNull();
    expect(normalizeRoutine({ days: Array(7).fill(42) })).toBeNull();
    const r = emptyRoutine();
    r.days[6] = "x".repeat(DAY_TEXT_MAX + 1);
    expect(normalizeRoutine(r)).toBeNull();
  });
});
