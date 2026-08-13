/**
 * Diet-plan document shape and validation (docs/build/slice-17-plan.md,
 * restructured in slice-21). Pure: the repository stores whatever this
 * normalizes.
 *
 * v2 gives each meal rows of (amount, food) plus numbered alternatives —
 * whole alternative versions of that meal, not extra items. v1 stored one
 * free-text string per meal; normalizeContent still accepts it and lifts
 * it into a single row, so plans written before this slice keep rendering
 * and upgrade the first time they are saved.
 */
import { findFood, macrosFor } from "./foods";

export const MEAL_SLOTS = [
  "BREAKFAST",
  "MID_MORNING",
  "LUNCH",
  "SNACK",
  "DINNER",
] as const;

export type MealSlot = (typeof MEAL_SLOTS)[number];

/**
 * `amount` stays free text ("150 g", "1 ud", "2 cucharadas"): forcing grams
 * would exclude foods measured in pieces, and every plan written before
 * slice-29 has one.
 *
 * `foodKey` and `grams` are what make a row countable (slice-29). Both
 * optional on purpose: a row with neither still renders and still saves, so
 * no existing plan became invalid and no specialist is forced to weigh a
 * salad to write one. Only rows that carry both reach the day's totals, and
 * the editor says how many did not.
 */
export type FoodRow = {
  amount: string;
  food: string;
  foodKey?: string;
  grams?: number;
};

/** A meal: the main list, plus zero or more alternative versions of it. */
export type Meal = { main: FoodRow[]; alternatives: FoodRow[][] };

export type DayPlan = Partial<Record<MealSlot, Meal>>;

export type DietPlanContent = { version: 2; days: DayPlan[] };

export const DAYS_PER_WEEK = 7;
export const AMOUNT_MAX = 16;
export const FOOD_MAX = 200;
export const ROWS_PER_GROUP_MAX = 20;
export const ALTERNATIVES_PER_MEAL_MAX = 5;
/** A single row above this is a typo, not a portion. */
export const GRAMS_MAX = 5000;

export function emptyContent(): DietPlanContent {
  return {
    version: 2,
    days: Array.from({ length: DAYS_PER_WEEK }, () => ({})),
  };
}

/** A meal with one blank row, which is what the editor opens with. */
export function emptyMeal(): Meal {
  return { main: [{ amount: "", food: "" }], alternatives: [] };
}

/**
 * Normalize one group of rows. Blank rows are dropped (the editor always
 * renders at least one). Returns null when a cap is exceeded — callers
 * surface an error rather than silently truncating a specialist's input.
 */
function normalizeRows(input: unknown): FoodRow[] | null {
  if (!Array.isArray(input)) return null;
  if (input.length > ROWS_PER_GROUP_MAX) return null;

  const rows: FoodRow[] = [];
  for (const row of input) {
    if (typeof row !== "object" || row === null) continue;
    const rawAmount = (row as Record<string, unknown>).amount;
    const rawFood = (row as Record<string, unknown>).food;
    const amount = typeof rawAmount === "string" ? rawAmount.trim() : "";
    const food = typeof rawFood === "string" ? rawFood.trim() : "";
    if (amount.length > AMOUNT_MAX || food.length > FOOD_MAX) return null;
    // A quantity with no food names nothing: the food is what carries the
    // row. Drop rows the specialist left blank.
    if (!food) continue;

    // A key is only kept when the catalogue still has it: a food withdrawn
    // from the table must not leave a row counting phantom calories. The
    // free text stays either way, so the row still reads.
    const rawKey = (row as Record<string, unknown>).foodKey;
    const rawGrams = (row as Record<string, unknown>).grams;
    const foodKey =
      typeof rawKey === "string" && findFood(rawKey) ? rawKey : undefined;
    const grams =
      typeof rawGrams === "number" && Number.isFinite(rawGrams) && rawGrams > 0
        ? Math.min(Math.round(rawGrams), GRAMS_MAX)
        : undefined;
    rows.push({
      amount,
      food,
      ...(foodKey ? { foodKey } : {}),
      ...(foodKey && grams ? { grams } : {}),
    });
  }
  return rows;
}

/**
 * `undefined` means "nothing here, drop the slot"; `null` means "invalid,
 * reject the whole document". Collapsing the two would silently discard
 * input that breached a cap.
 */
type MealResult = Meal | undefined | null;

/** v1 meal (a single string) lifted into one v2 row. */
function liftLegacyMeal(text: string): MealResult {
  const food = text.trim();
  if (!food) return undefined;
  if (food.length > FOOD_MAX) {
    return { main: [{ amount: "", food: food.slice(0, FOOD_MAX) }], alternatives: [] };
  }
  return { main: [{ amount: "", food }], alternatives: [] };
}

function normalizeMeal(input: unknown): MealResult {
  // v1: the slot held a plain string.
  if (typeof input === "string") return liftLegacyMeal(input);
  if (typeof input !== "object" || input === null) return null;

  const main = normalizeRows((input as { main?: unknown }).main);
  if (main === null) return null;

  const rawAlternatives = (input as { alternatives?: unknown }).alternatives;
  const alternatives: FoodRow[][] = [];
  if (rawAlternatives !== undefined) {
    if (!Array.isArray(rawAlternatives)) return null;
    if (rawAlternatives.length > ALTERNATIVES_PER_MEAL_MAX) return null;
    for (const group of rawAlternatives) {
      const rows = normalizeRows(group);
      if (rows === null) return null;
      // An alternative with no rows carries no meaning; drop it.
      if (rows.length > 0) alternatives.push(rows);
    }
  }

  if (main.length === 0 && alternatives.length === 0) return undefined;
  return { main, alternatives };
}

/**
 * Normalize untrusted content: exactly 7 days, known slots only, trimmed
 * strings, empty meals dropped, caps enforced. Accepts both v1 and v2.
 * Returns null when the shape is not salvageable.
 */
export function normalizeContent(input: unknown): DietPlanContent | null {
  if (typeof input !== "object" || input === null) return null;
  const days = (input as { days?: unknown }).days;
  if (!Array.isArray(days) || days.length !== DAYS_PER_WEEK) return null;

  const normalized: DietPlanContent = { version: 2, days: [] };
  for (const day of days) {
    const out: DayPlan = {};
    if (typeof day === "object" && day !== null) {
      for (const slot of MEAL_SLOTS) {
        const value = (day as Record<string, unknown>)[slot];
        if (value === undefined || value === null) continue;
        const meal = normalizeMeal(value);
        if (meal === null) return null;
        if (meal) out[slot] = meal;
      }
    }
    normalized.days.push(out);
  }
  return normalized;
}

/** True when no meal has content. */
export function isEmptyPlan(content: DietPlanContent): boolean {
  return content.days.every((day) => Object.keys(day).length === 0);
}

/** Flat "150 g pollo · 80 g arroz" rendering, for compact contexts. */
export function summarizeRows(rows: FoodRow[]): string {
  return rows
    .map((row) => (row.amount ? `${row.amount} ${row.food}` : row.food))
    .join(" · ");
}

/**
 * Rebuild a week from posted editor fields. The editor's rows are
 * dynamic, so the shape is recovered from field names rather than a fixed
 * loop:
 *
 *   meal-{day}-{slot}-{group}-{row}-{amount|food|foodKey|grams}
 *   group = main | alt{n}
 *
 * Returns raw (un-normalized) content: pass it through normalizeContent,
 * which enforces every cap and drops blanks.
 */
export function contentFromEntries(
  entries: Iterable<[string, string]>,
): unknown {
  const FIELD =
    /^meal-(\d+)-([A-Z_]+)-(main|alt\d+)-(\d+)-(amount|food|foodKey|grams)$/;
  type Cell = {
    amount?: string;
    food?: string;
    foodKey?: string;
    grams?: number;
  };
  const cells = new Map<string, Cell>();

  for (const [key, value] of entries) {
    const match = key.match(FIELD);
    if (!match) continue;
    const [, day, slot, group, row, field] = match;
    const id = `${day}|${slot}|${group}|${row}`;
    const cell = cells.get(id) ?? {};
    if (field === "grams") {
      // The field is a text input, so an empty or unparseable value simply
      // means "not weighed" and the row falls back to free text.
      const grams = Number(value.replace(",", "."));
      if (Number.isFinite(grams) && grams > 0) cell.grams = grams;
    } else {
      cell[field as "amount" | "food" | "foodKey"] = value;
    }
    cells.set(id, cell);
  }

  const days: Record<string, { main: FoodRow[]; alternatives: FoodRow[][] }>[] =
    Array.from({ length: DAYS_PER_WEEK }, () => ({}));

  // Sort by (day, group, row) so the specialist's ordering survives.
  const sorted = [...cells.entries()].sort((a, b) => {
    const [dayA, , groupA, rowA] = a[0].split("|");
    const [dayB, , groupB, rowB] = b[0].split("|");
    return (
      Number(dayA) - Number(dayB) ||
      groupA.localeCompare(groupB) ||
      Number(rowA) - Number(rowB)
    );
  });

  for (const [id, cell] of sorted) {
    const [dayRaw, slot, group] = id.split("|");
    const day = Number(dayRaw);
    if (!Number.isInteger(day) || day < 0 || day >= DAYS_PER_WEEK) continue;
    if (!(MEAL_SLOTS as readonly string[]).includes(slot)) continue;

    const meal = (days[day][slot] ??= { main: [], alternatives: [] });
    const row: FoodRow = {
      amount: cell.amount ?? "",
      food: cell.food ?? "",
      ...(cell.foodKey ? { foodKey: cell.foodKey } : {}),
      ...(cell.grams ? { grams: cell.grams } : {}),
    };
    if (group === "main") {
      meal.main.push(row);
      continue;
    }
    const altIndex = Number(group.slice(3));
    if (!Number.isInteger(altIndex) || altIndex < 0) continue;
    (meal.alternatives[altIndex] ??= []).push(row);
  }

  // Alternatives arrive keyed by editor index; close the holes left by
  // any group removed before saving.
  for (const day of days) {
    for (const slot of Object.keys(day)) {
      day[slot].alternatives = day[slot].alternatives.filter(Boolean);
    }
  }

  return { days };
}


export type DayTotals = {
  kcal: number;
  proteinG: number;
  /** Rows in the day's main meals with no catalogue food behind them. */
  uncounted: number;
};

/**
 * What a day adds up to, from the main version of each meal only:
 * alternatives are substitutes, and counting them would double the day.
 *
 * `uncounted` is part of the answer, not a detail. A total that silently
 * ignores half a meal is worse than no total, so every caller can say how
 * complete it is.
 */
export function dayTotals(day: DayPlan): DayTotals {
  let kcal = 0;
  let proteinG = 0;
  let uncounted = 0;

  for (const slot of MEAL_SLOTS) {
    for (const row of day[slot]?.main ?? []) {
      if (!row.foodKey || !row.grams) {
        uncounted += 1;
        continue;
      }
      const macros = macrosFor(row.foodKey, row.grams);
      kcal += macros.kcal;
      proteinG += macros.proteinG;
    }
  }

  return { kcal, proteinG: Math.round(proteinG * 10) / 10, uncounted };
}
