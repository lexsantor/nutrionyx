import { describe, expect, it } from "vitest";
import {
  ALTERNATIVES_PER_MEAL_MAX,
  contentFromEntries,
  AMOUNT_MAX,
  DAYS_PER_WEEK,
  FOOD_MAX,
  ROWS_PER_GROUP_MAX,
  emptyContent,
  isEmptyPlan,
  normalizeContent,
  summarizeRows,
} from "./plan";

/** A 7-day skeleton with `day0` as Monday, so cases stay short. */
function week(day0: unknown): unknown {
  return {
    days: [day0, ...Array.from({ length: DAYS_PER_WEEK - 1 }, () => ({}))],
  };
}

describe("normalizeContent", () => {
  it("rejects shapes that are not a 7-day week", () => {
    expect(normalizeContent(null)).toBeNull();
    expect(normalizeContent({})).toBeNull();
    expect(normalizeContent({ days: [] })).toBeNull();
    expect(normalizeContent({ days: Array(6).fill({}) })).toBeNull();
  });

  it("keeps rows, trims them, and drops rows with no food", () => {
    const result = normalizeContent(
      week({
        BREAKFAST: {
          main: [
            { amount: " 150 g ", food: " Pollo " },
            { amount: "80", food: "" },
            { amount: "", food: "Arroz" },
          ],
        },
      }),
    );
    expect(result?.days[0].BREAKFAST).toEqual({
      main: [
        { amount: "150 g", food: "Pollo" },
        { amount: "", food: "Arroz" },
      ],
      alternatives: [],
    });
  });

  it("keeps numbered alternatives and drops empty ones", () => {
    const result = normalizeContent(
      week({
        LUNCH: {
          main: [{ amount: "200 g", food: "Merluza" }],
          alternatives: [
            [{ amount: "180 g", food: "Salmón" }],
            [{ amount: "", food: "" }],
            [{ amount: "2 ud", food: "Huevo" }],
          ],
        },
      }),
    );
    expect(result?.days[0].LUNCH?.alternatives).toEqual([
      [{ amount: "180 g", food: "Salmón" }],
      [{ amount: "2 ud", food: "Huevo" }],
    ]);
  });

  it("drops a meal whose main and alternatives are all empty", () => {
    const result = normalizeContent(
      week({ DINNER: { main: [{ amount: "100", food: "  " }] } }),
    );
    expect(result?.days[0].DINNER).toBeUndefined();
  });

  it("ignores unknown slots", () => {
    const result = normalizeContent(
      week({ BRUNCH: { main: [{ amount: "", food: "Tostada" }] } }),
    );
    expect(result?.days[0]).toEqual({});
  });

  it("rejects input past the caps instead of truncating", () => {
    const longAmount = "x".repeat(AMOUNT_MAX + 1);
    expect(
      normalizeContent(week({ SNACK: { main: [{ amount: longAmount, food: "Nueces" }] } })),
    ).toBeNull();

    const longFood = "x".repeat(FOOD_MAX + 1);
    expect(
      normalizeContent(week({ SNACK: { main: [{ amount: "", food: longFood }] } })),
    ).toBeNull();

    const tooManyRows = Array.from({ length: ROWS_PER_GROUP_MAX + 1 }, () => ({
      amount: "",
      food: "Arroz",
    }));
    expect(normalizeContent(week({ SNACK: { main: tooManyRows } }))).toBeNull();

    const tooManyAlternatives = Array.from(
      { length: ALTERNATIVES_PER_MEAL_MAX + 1 },
      () => [{ amount: "", food: "Arroz" }],
    );
    expect(
      normalizeContent(
        week({ SNACK: { main: [{ amount: "", food: "Pan" }], alternatives: tooManyAlternatives } }),
      ),
    ).toBeNull();
  });

  it("lifts a v1 string meal into one v2 row", () => {
    const result = normalizeContent(
      week({ BREAKFAST: "Tostada de aguacate con huevo" }),
    );
    expect(result?.version).toBe(2);
    expect(result?.days[0].BREAKFAST).toEqual({
      main: [{ amount: "", food: "Tostada de aguacate con huevo" }],
      alternatives: [],
    });
  });

  it("drops a blank v1 meal", () => {
    expect(normalizeContent(week({ BREAKFAST: "   " }))?.days[0]).toEqual({});
  });

  it("truncates rather than rejects an over-long v1 string", () => {
    // A v1 meal allowed 1000 chars; rejecting would make an old plan
    // unopenable, so this one case clamps instead.
    const legacy = "x".repeat(FOOD_MAX + 50);
    const result = normalizeContent(week({ LUNCH: legacy }));
    expect(result?.days[0].LUNCH?.main[0].food).toHaveLength(FOOD_MAX);
  });

  it("round-trips its own output", () => {
    const once = normalizeContent(
      week({
        BREAKFAST: {
          main: [{ amount: "150 g", food: "Pollo" }],
          alternatives: [[{ amount: "2 ud", food: "Huevo" }]],
        },
      }),
    );
    expect(normalizeContent(once)).toEqual(once);
  });
});

describe("isEmptyPlan", () => {
  it("is true for a fresh plan and false once a meal exists", () => {
    expect(isEmptyPlan(emptyContent())).toBe(true);
    const filled = normalizeContent(
      week({ DINNER: { main: [{ amount: "", food: "Sopa" }] } }),
    )!;
    expect(isEmptyPlan(filled)).toBe(false);
  });
});

describe("summarizeRows", () => {
  it("joins amount and food, omitting a missing amount", () => {
    expect(
      summarizeRows([
        { amount: "150 g", food: "Pollo" },
        { amount: "", food: "Ensalada" },
      ]),
    ).toBe("150 g Pollo · Ensalada");
  });
});

describe("contentFromEntries", () => {
  /** Mimics what the editor posts for one meal. */
  const field = (
    day: number,
    slot: string,
    group: string,
    row: number,
    part: "amount" | "food",
    value: string,
  ): [string, string] => [
    `meal-${day}-${slot}-${group}-${row}-${part}`,
    value,
  ];

  it("rebuilds main rows in the order the editor rendered them", () => {
    const content = normalizeContent(
      contentFromEntries([
        field(0, "BREAKFAST", "main", 1, "amount", "80 g"),
        field(0, "BREAKFAST", "main", 1, "food", "Arroz"),
        field(0, "BREAKFAST", "main", 0, "amount", "150 g"),
        field(0, "BREAKFAST", "main", 0, "food", "Pollo"),
      ]),
    );
    expect(content?.days[0].BREAKFAST?.main).toEqual([
      { amount: "150 g", food: "Pollo" },
      { amount: "80 g", food: "Arroz" },
    ]);
  });

  it("rebuilds alternatives and closes holes left by a removed group", () => {
    // The editor removed alt0, so only alt1 and alt2 are posted.
    const content = normalizeContent(
      contentFromEntries([
        field(2, "LUNCH", "main", 0, "amount", "200 g"),
        field(2, "LUNCH", "main", 0, "food", "Merluza"),
        field(2, "LUNCH", "alt1", 0, "amount", "180 g"),
        field(2, "LUNCH", "alt1", 0, "food", "Salmón"),
        field(2, "LUNCH", "alt2", 0, "amount", "2 ud"),
        field(2, "LUNCH", "alt2", 0, "food", "Huevo"),
      ]),
    );
    expect(content?.days[2].LUNCH?.alternatives).toEqual([
      [{ amount: "180 g", food: "Salmón" }],
      [{ amount: "2 ud", food: "Huevo" }],
    ]);
  });

  it("ignores unrelated fields, unknown slots and out-of-range days", () => {
    const content = normalizeContent(
      contentFromEntries([
        ["title", "Plan semanal"],
        ["patientId", "abc"],
        field(0, "BRUNCH", "main", 0, "food", "Tostada"),
        field(9, "LUNCH", "main", 0, "food", "Fuera de rango"),
        field(1, "DINNER", "main", 0, "food", "Sopa"),
      ]),
    );
    expect(content?.days[0]).toEqual({});
    expect(content?.days[1].DINNER?.main).toEqual([
      { amount: "", food: "Sopa" },
    ]);
  });

  it("produces a valid empty week when nothing was filled in", () => {
    const content = normalizeContent(
      contentFromEntries([
        field(0, "BREAKFAST", "main", 0, "amount", ""),
        field(0, "BREAKFAST", "main", 0, "food", ""),
      ]),
    );
    expect(content).not.toBeNull();
    expect(isEmptyPlan(content!)).toBe(true);
  });

  it("survives a full round trip: entries -> content -> entries", () => {
    const first = normalizeContent(
      contentFromEntries([
        field(3, "SNACK", "main", 0, "amount", "30 g"),
        field(3, "SNACK", "main", 0, "food", "Almendras"),
        field(3, "SNACK", "alt0", 0, "amount", "1 ud"),
        field(3, "SNACK", "alt0", 0, "food", "Plátano"),
      ]),
    )!;
    // Re-post what the editor would render from `first`.
    const reposted = normalizeContent(
      contentFromEntries([
        field(3, "SNACK", "main", 0, "amount", first.days[3].SNACK!.main[0].amount),
        field(3, "SNACK", "main", 0, "food", first.days[3].SNACK!.main[0].food),
        field(3, "SNACK", "alt0", 0, "amount", first.days[3].SNACK!.alternatives[0][0].amount),
        field(3, "SNACK", "alt0", 0, "food", first.days[3].SNACK!.alternatives[0][0].food),
      ]),
    );
    expect(reposted).toEqual(first);
  });
});
