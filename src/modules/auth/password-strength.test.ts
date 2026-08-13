import { describe, expect, it } from "vitest";
import { passwordStrength } from "./password-strength";

describe("password strength", () => {
  it("refuses to reward a long password that is on every list", () => {
    // The point of the whole module: entropy would score this well.
    expect(passwordStrength("P@ssword123!").score).toBe(0);
    expect(passwordStrength("P@ssword123!").reason).toBe("common");
  });

  it("scores by length first", () => {
    // A long ordinary phrase beats a short scrambled one, which is the whole
    // reason the score does not start from character variety.
    expect(passwordStrength("correbateriaverde").score).toBe(3);
    expect(passwordStrength("aX3!kq9z").score).toBeLessThan(3);
    expect(passwordStrength("correbateriaverde9X").score).toBe(4);
  });

  it("names what is wrong", () => {
    expect(passwordStrength("corto1").reason).toBe("short");
    expect(passwordStrength("aaaaaaaaaa").reason).toBe("repeated");
    expect(passwordStrength("mnbvcxz-defgh").reason).toBe("sequence");
    expect(passwordStrength("marimarimari").reason).toBe("variety");
  });

  it("says nothing about an empty field", () => {
    expect(passwordStrength("")).toEqual({ score: 0, reason: null });
  });
});
