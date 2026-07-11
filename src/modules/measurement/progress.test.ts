import { describe, expect, it } from "vitest";
import { chartRange, trendToward, weightDelta } from "./progress";

describe("weightDelta", () => {
  it("is positive above the goal, negative below, zero at goal", () => {
    expect(weightDelta(72.4, 68)).toBe(4.4);
    expect(weightDelta(66.1, 68)).toBe(-1.9);
    expect(weightDelta(68, 68)).toBe(0);
  });
});

describe("trendToward", () => {
  it("is success when moving closer to the goal, either direction", () => {
    expect(trendToward(80, 76, 68)).toBe(true); // losing toward a lower goal
    expect(trendToward(60, 64, 68)).toBe(true); // gaining toward a higher goal
    expect(trendToward(72, 74, 68)).toBe(false); // moving away
    expect(trendToward(70, 70, 68)).toBe(false); // no progress
  });
});

describe("chartRange", () => {
  it("pads the data range and never anchors at zero", () => {
    const { min, max } = chartRange([70, 72, 74]);
    expect(min).toBeGreaterThan(0);
    expect(min).toBeLessThan(70);
    expect(max).toBeGreaterThan(74);
  });

  it("handles a single value", () => {
    const { min, max } = chartRange([70]);
    expect(min).toBeLessThan(70);
    expect(max).toBeGreaterThan(70);
  });

  it("returns a safe default when empty", () => {
    expect(chartRange([])).toEqual({ min: 0, max: 1 });
  });
});
