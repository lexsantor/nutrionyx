import { describe, expect, it } from "vitest";
import {
  emptyContent,
  isEmptyPlan,
  normalizeContent,
  MEAL_TEXT_MAX,
} from "./plan";

describe("diet plan content", () => {
  it("empty content has 7 empty days", () => {
    const c = emptyContent();
    expect(c.days.length).toBe(7);
    expect(isEmptyPlan(c)).toBe(true);
  });

  it("normalizes: trims, drops empties and unknown slots", () => {
    const raw = emptyContent() as unknown as {
      days: Record<string, unknown>[];
    };
    raw.days[0] = {
      BREAKFAST: "  Avena con fruta  ",
      LUNCH: "   ",
      HACKED: "x",
      DINNER: 42,
    };
    const c = normalizeContent(raw)!;
    expect(c.days[0]).toEqual({ BREAKFAST: "Avena con fruta" });
    expect(isEmptyPlan(c)).toBe(false);
  });

  it("rejects wrong shapes and oversized meals", () => {
    expect(normalizeContent(null)).toBeNull();
    expect(normalizeContent({ days: [] })).toBeNull();
    const raw = emptyContent();
    raw.days[3].LUNCH = "x".repeat(MEAL_TEXT_MAX + 1);
    expect(normalizeContent(raw)).toBeNull();
  });
});
