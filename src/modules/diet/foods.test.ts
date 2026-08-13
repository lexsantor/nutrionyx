import { describe, expect, it } from "vitest";
import { FOODS, findFood, macrosFor } from "./foods";

/**
 * The catalogue's values are reference figures typed by hand, not an import,
 * so the one thing that can be checked automatically is that each row is
 * internally consistent: kcal should be roughly 4·protein + 4·carbs + 9·fat.
 *
 * This catches a transposed digit or a value in the wrong column. It cannot
 * catch a figure that is merely wrong, which is why the module says so and
 * why a nutritionist has to review the table before it prescribes anything.
 */
describe("food catalogue", () => {
  it("has unique keys", () => {
    const keys = FOODS.map((food) => food.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("agrees with the Atwater factors within 12%", () => {
    const off = FOODS.filter((food) => {
      const derived =
        food.proteinG * 4 + food.carbsG * 4 + food.fatG * 9;
      // Fibre, alcohol and rounding all pull the sum around; 12% is wide
      // enough not to fire on those and tight enough to catch a typo.
      const tolerance = Math.max(food.kcal * 0.12, 12);
      return Math.abs(derived - food.kcal) > tolerance;
    });
    expect(
      off.map((f) => `${f.key}: ${f.kcal} kcal vs ${Math.round(f.proteinG * 4 + f.carbsG * 4 + f.fatG * 9)} derived`),
    ).toEqual([]);
  });

  it("keeps every macro non-negative and plausible per 100 g", () => {
    for (const food of FOODS) {
      expect(food.kcal).toBeGreaterThanOrEqual(0);
      expect(food.kcal).toBeLessThanOrEqual(900);
      for (const macro of [food.proteinG, food.carbsG, food.fatG]) {
        expect(macro).toBeGreaterThanOrEqual(0);
        expect(macro).toBeLessThanOrEqual(100);
      }
      expect(food.proteinG + food.carbsG + food.fatG).toBeLessThanOrEqual(100);
    }
  });

  it("scales by grams and ignores unknown keys", () => {
    expect(macrosFor("pechuga-pollo", 200)).toEqual({ kcal: 330, proteinG: 62 });
    expect(macrosFor("pechuga-pollo", 0)).toEqual({ kcal: 0, proteinG: 0 });
    expect(macrosFor("no-existe", 100)).toEqual({ kcal: 0, proteinG: 0 });
    expect(macrosFor(undefined, 100)).toEqual({ kcal: 0, proteinG: 0 });
    expect(findFood("no-existe")).toBeNull();
  });
});
