import { describe, expect, it } from "vitest";
import { specialtyConfig, SPECIALTY_TYPES } from "./config";

describe("specialtyConfig", () => {
  it("maps the sports sub-role to its own terminology", () => {
    const cfg = specialtyConfig("SPORTS_NUTRITIONIST");
    expect(cfg.labelKey).toBe("specialty.labels.sports");
    expect(cfg.planTermKey).toBe("specialty.planTerm.sports");
  });

  it("maps the dietitian sub-role to its own terminology", () => {
    const cfg = specialtyConfig("DIETITIAN");
    expect(cfg.labelKey).toBe("specialty.labels.dietitian");
  });

  it("falls back to dietitian when the sub-role is unset (backfill)", () => {
    expect(specialtyConfig(null)).toEqual(specialtyConfig("DIETITIAN"));
    expect(specialtyConfig(undefined)).toEqual(specialtyConfig("DIETITIAN"));
  });

  it("exposes exactly the two selectable sub-roles", () => {
    expect([...SPECIALTY_TYPES]).toEqual(["DIETITIAN", "SPORTS_NUTRITIONIST"]);
  });
});
