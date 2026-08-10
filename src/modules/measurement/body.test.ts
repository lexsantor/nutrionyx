import { describe, expect, it } from "vitest";
import { fatMassKg, leanMassKg, waistHipRatio } from "./body";

describe("body composition derivations", () => {
  it("waist/hip ratio rounds to 2 decimals", () => {
    expect(waistHipRatio(81, 90)).toBe(0.9);
    expect(waistHipRatio(0, 90)).toBeNull();
  });

  it("fat mass = weight x pct, 2 decimals", () => {
    expect(fatMassKg(88, 23.4)).toBe(20.59);
    expect(fatMassKg(88, 0)).toBeNull();
    expect(fatMassKg(88, 100)).toBeNull();
  });

  it("lean mass = weight - fat mass, 1 decimal", () => {
    expect(leanMassKg(88, 23.4)).toBe(67.4);
    expect(leanMassKg(0, 23.4)).toBeNull();
  });
});
