import { describe, expect, it } from "vitest";
import { ageInYears } from "./age";

describe("ageInYears", () => {
  const now = new Date("2026-07-11T00:00:00Z").getTime();

  it("computes whole years elapsed", () => {
    expect(ageInYears(new Date("2000-07-11T00:00:00Z"), now)).toBe(26);
  });

  it("does not round up before the birthday", () => {
    expect(ageInYears(new Date("2000-12-31T00:00:00Z"), now)).toBe(25);
  });
});
