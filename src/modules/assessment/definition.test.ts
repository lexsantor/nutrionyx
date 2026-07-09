import { describe, expect, it } from "vitest";
import {
  ASSESSMENT_STEPS,
  firstUnansweredStep,
  missingRequiredFields,
  validateAnswer,
} from "./definition";

const TODAY = new Date("2026-07-09T00:00:00Z");

describe("validateAnswer", () => {
  it("accepts valid enum options and rejects unknown ones", () => {
    expect(validateAnswer("sex", "FEMALE")).toEqual({ ok: true, value: "FEMALE" });
    expect(validateAnswer("sex", "OTHER")).toEqual({
      ok: false,
      errorKey: "invalidOption",
    });
    expect(validateAnswer("activityLevel", "MEDIUM")).toEqual({
      ok: true,
      value: "MEDIUM",
    });
  });

  it("validates birth date against the provisional age floor", () => {
    expect(validateAnswer("birthDate", "1990-05-01", TODAY)).toEqual({
      ok: true,
      value: "1990-05-01",
    });
    expect(validateAnswer("birthDate", "2015-01-01", TODAY)).toEqual({
      ok: false,
      errorKey: "tooYoung",
    });
    expect(validateAnswer("birthDate", "not-a-date", TODAY)).toEqual({
      ok: false,
      errorKey: "invalidDate",
    });
  });

  it("parses numbers with comma decimals and enforces bounds", () => {
    expect(validateAnswer("weightKg", "82,5")).toEqual({ ok: true, value: 82.5 });
    expect(validateAnswer("heightCm", "181.2")).toEqual({ ok: true, value: 181.2 });
    expect(validateAnswer("weightKg", "10")).toEqual({
      ok: false,
      errorKey: "outOfRange",
    });
    expect(validateAnswer("heightCm", "abc")).toEqual({
      ok: false,
      errorKey: "invalidNumber",
    });
  });

  it("requires at least one valid goal and drops unknown ids", () => {
    expect(validateAnswer("goals", ["lose-weight", "nonsense"])).toEqual({
      ok: true,
      value: ["lose-weight"],
    });
    expect(validateAnswer("goals", ["nonsense"])).toEqual({
      ok: false,
      errorKey: "selectAtLeastOne",
    });
  });

  it("treats empty optional text as an explicit none", () => {
    expect(validateAnswer("conditions", "")).toEqual({ ok: true, value: "" });
    expect(validateAnswer("allergies", "  gluten ")).toEqual({
      ok: true,
      value: "gluten",
    });
  });
});

describe("missingRequiredFields", () => {
  it("lists everything for an empty assessment", () => {
    expect(missingRequiredFields({})).toHaveLength(7);
  });

  it("is empty when all required fields are present", () => {
    expect(
      missingRequiredFields({
        sex: "MALE",
        birthDate: "1990-05-01",
        heightCm: 181.2,
        weightKg: 110,
        targetWeightKg: 95,
        activityLevel: "MEDIUM",
        goals: ["lose-weight"],
      }),
    ).toHaveLength(0);
  });

  it("treats empty goals as missing", () => {
    expect(missingRequiredFields({ goals: [] })).toContain("goals");
  });
});

describe("firstUnansweredStep", () => {
  it("starts at 0 for a fresh assessment", () => {
    expect(firstUnansweredStep({})).toBe(0);
  });

  it("resumes at the first gap, not the last answer", () => {
    expect(
      firstUnansweredStep({ sex: "FEMALE", birthDate: "1990-05-01" }),
    ).toBe(2);
  });

  it("returns the step count when everything is answered", () => {
    const all = {
      sex: "FEMALE",
      birthDate: "1990-05-01",
      heightCm: 165,
      weightKg: 70,
      targetWeightKg: 63,
      activityLevel: "LOW",
      goals: ["improve-health"],
      conditions: "",
      allergies: "",
      currentMedication: "",
    };
    expect(firstUnansweredStep(all)).toBe(ASSESSMENT_STEPS.length);
  });
});
