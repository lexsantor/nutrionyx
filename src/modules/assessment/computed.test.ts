import { describe, expect, it } from "vitest";
import {
  bmi,
  bmiCategory,
  lossTier,
  targetDeltaRatio,
} from "./computed";

describe("bmi", () => {
  it("computes the reference case from discovery (33.5)", () => {
    // Reference flow summary showed BMI 33.5; 110 kg at ~181.2 cm reproduces it.
    expect(bmi(110, 181.2)).toBe(33.5);
  });

  it("rounds to one decimal", () => {
    expect(bmi(70, 175)).toBe(22.9);
  });

  it("rejects non-positive inputs", () => {
    expect(() => bmi(0, 175)).toThrow(RangeError);
    expect(() => bmi(70, 0)).toThrow(RangeError);
    expect(() => bmi(-70, 175)).toThrow(RangeError);
  });
});

describe("bmiCategory", () => {
  it("classifies WHO boundaries correctly", () => {
    expect(bmiCategory(18.4)).toBe("underweight");
    expect(bmiCategory(18.5)).toBe("normal");
    expect(bmiCategory(24.9)).toBe("normal");
    expect(bmiCategory(25)).toBe("overweight");
    expect(bmiCategory(29.9)).toBe("overweight");
    expect(bmiCategory(30)).toBe("obesity");
  });
});

describe("targetDeltaRatio", () => {
  it("computes the reference case (126 -> 110 is ~12.7% loss)", () => {
    expect(targetDeltaRatio(126, 110)).toBeCloseTo(0.127, 3);
  });

  it("is negative for weight gain targets", () => {
    expect(targetDeltaRatio(60, 66)).toBeCloseTo(-0.1, 5);
  });

  it("rejects non-positive weights", () => {
    expect(() => targetDeltaRatio(0, 60)).toThrow(RangeError);
    expect(() => targetDeltaRatio(60, 0)).toThrow(RangeError);
  });
});

describe("lossTier", () => {
  it("maps gain and small loss to info", () => {
    expect(lossTier(-0.1)).toBe("info");
    expect(lossTier(0)).toBe("info");
    expect(lossTier(0.049)).toBe("info");
  });

  it("maps moderate loss to healthy, boundaries inclusive-exclusive", () => {
    expect(lossTier(0.05)).toBe("healthy");
    expect(lossTier(0.13)).toBe("healthy");
    expect(lossTier(0.149)).toBe("healthy");
  });

  it("maps large loss to aggressive", () => {
    expect(lossTier(0.15)).toBe("aggressive");
    expect(lossTier(0.4)).toBe("aggressive");
  });
});
