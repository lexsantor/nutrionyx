/**
 * Food catalogue (docs/build/slice-29-plan.md). The specialist picks from this
 * list instead of typing, so a row can carry composition and a day can be
 * totalled. Same shape and same rules as the exercise catalogue: `key` is the
 * stable identifier a plan stores, so keys are append-only in practice and
 * renaming a `name` updates every plan that references it.
 *
 * **Provenance, stated plainly.** These values are ordinary reference figures
 * for generic foods, not an import from a named database. They are close
 * enough to total a week and NOT a clinical source: before this is used to
 * prescribe, either a nutritionist reviews the table or it is replaced by an
 * import (see the plan for which databases are licence-clean — USDA is public
 * domain, CIQUAL needs attribution, Open Food Facts is share-alike and must be
 * avoided, BEDCA's commercial terms are unconfirmed).
 *
 * `foods.test.ts` checks every row against the Atwater factors, which catches
 * a transposed digit but cannot catch a value that is merely wrong.
 */

export const FOOD_GROUPS = [
  "PROTEIN",
  "CARB",
  "VEGETABLE",
  "FRUIT",
  "DAIRY",
  "FAT",
  "OTHER",
] as const;

export type FoodGroup = (typeof FOOD_GROUPS)[number];

export type CatalogueFood = {
  key: string;
  name: string;
  group: FoodGroup;
  /** Grams one "unit" weighs, for foods a plan counts in pieces. */
  unitGrams?: number;
  /**
   * Per 100 g, as eaten. `carbsG` is AVAILABLE carbohydrate, the European
   * convention (BEDCA: "hidratos de carbono disponibles"), which is what makes
   * the Atwater check in the test meaningful. Foods that are mostly fibre —
   * cocoa powder, chia — are left out rather than special-cased: their energy
   * cannot be derived from three macros, so the check could say nothing about
   * them.
   */
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export const FOODS: readonly CatalogueFood[] = [
  // Protein
  { key: "pechuga-pollo", name: "Pechuga de pollo", group: "PROTEIN", kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
  { key: "muslo-pollo", name: "Muslo de pollo", group: "PROTEIN", kcal: 209, proteinG: 26, carbsG: 0, fatG: 11 },
  { key: "pavo", name: "Pechuga de pavo", group: "PROTEIN", kcal: 135, proteinG: 29, carbsG: 0, fatG: 1.5 },
  { key: "ternera-magra", name: "Ternera magra", group: "PROTEIN", kcal: 175, proteinG: 26, carbsG: 0, fatG: 7.5 },
  { key: "solomillo-cerdo", name: "Solomillo de cerdo", group: "PROTEIN", kcal: 143, proteinG: 26, carbsG: 0, fatG: 3.5 },
  { key: "lomo-cerdo", name: "Lomo de cerdo", group: "PROTEIN", kcal: 210, proteinG: 27, carbsG: 0, fatG: 11 },
  { key: "merluza", name: "Merluza", group: "PROTEIN", kcal: 90, proteinG: 17, carbsG: 0, fatG: 2.2 },
  { key: "bacalao", name: "Bacalao fresco", group: "PROTEIN", kcal: 82, proteinG: 18, carbsG: 0, fatG: 0.7 },
  { key: "salmon", name: "Salmón", group: "PROTEIN", kcal: 208, proteinG: 20, carbsG: 0, fatG: 13 },
  { key: "atun-fresco", name: "Atún fresco", group: "PROTEIN", kcal: 144, proteinG: 23, carbsG: 0, fatG: 5 },
  { key: "atun-lata-natural", name: "Atún en lata al natural", group: "PROTEIN", kcal: 116, proteinG: 26, carbsG: 0, fatG: 1 },
  { key: "sardinas", name: "Sardinas", group: "PROTEIN", kcal: 208, proteinG: 25, carbsG: 0, fatG: 11.5 },
  { key: "gambas", name: "Gambas", group: "PROTEIN", kcal: 85, proteinG: 20, carbsG: 0, fatG: 0.5 },
  { key: "huevo", name: "Huevo", group: "PROTEIN", unitGrams: 55, kcal: 143, proteinG: 13, carbsG: 0.7, fatG: 9.5 },
  { key: "clara-huevo", name: "Clara de huevo", group: "PROTEIN", unitGrams: 33, kcal: 52, proteinG: 11, carbsG: 0.7, fatG: 0.2 },
  { key: "tofu", name: "Tofu", group: "PROTEIN", kcal: 144, proteinG: 15, carbsG: 2.8, fatG: 8.7 },
  { key: "seitan", name: "Seitán", group: "PROTEIN", kcal: 121, proteinG: 24, carbsG: 4, fatG: 0.5 },
  { key: "jamon-serrano", name: "Jamón serrano", group: "PROTEIN", kcal: 241, proteinG: 31, carbsG: 0, fatG: 13 },
  { key: "jamon-cocido", name: "Jamón cocido", group: "PROTEIN", kcal: 107, proteinG: 18, carbsG: 1.5, fatG: 3.3 },

  // Carbohydrate
  { key: "arroz-blanco-cocido", name: "Arroz blanco cocido", group: "CARB", kcal: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3 },
  { key: "arroz-integral-cocido", name: "Arroz integral cocido", group: "CARB", kcal: 123, proteinG: 2.7, carbsG: 26, fatG: 1 },
  { key: "pasta-cocida", name: "Pasta cocida", group: "CARB", kcal: 158, proteinG: 5.8, carbsG: 31, fatG: 0.9 },
  { key: "pasta-integral-cocida", name: "Pasta integral cocida", group: "CARB", kcal: 149, proteinG: 6, carbsG: 30, fatG: 1.4 },
  { key: "patata-cocida", name: "Patata cocida", group: "CARB", kcal: 86, proteinG: 1.7, carbsG: 20, fatG: 0.1 },
  { key: "boniato", name: "Boniato", group: "CARB", kcal: 90, proteinG: 2, carbsG: 21, fatG: 0.1 },
  { key: "pan-blanco", name: "Pan blanco", group: "CARB", kcal: 265, proteinG: 9, carbsG: 49, fatG: 3.2 },
  { key: "pan-integral", name: "Pan integral", group: "CARB", kcal: 247, proteinG: 13, carbsG: 41, fatG: 3.4 },
  { key: "avena", name: "Copos de avena", group: "CARB", kcal: 379, proteinG: 13, carbsG: 68, fatG: 6.5 },
  { key: "quinoa-cocida", name: "Quinoa cocida", group: "CARB", kcal: 120, proteinG: 4.4, carbsG: 21, fatG: 1.9 },
  { key: "cuscus-cocido", name: "Cuscús cocido", group: "CARB", kcal: 112, proteinG: 3.8, carbsG: 23, fatG: 0.2 },
  { key: "lentejas-cocidas", name: "Lentejas cocidas", group: "CARB", kcal: 116, proteinG: 9, carbsG: 20, fatG: 0.4 },
  { key: "garbanzos-cocidos", name: "Garbanzos cocidos", group: "CARB", kcal: 164, proteinG: 8.9, carbsG: 27, fatG: 2.6 },
  { key: "alubias-cocidas", name: "Alubias cocidas", group: "CARB", kcal: 127, proteinG: 8.7, carbsG: 23, fatG: 0.5 },
  { key: "maiz-dulce", name: "Maíz dulce", group: "CARB", kcal: 86, proteinG: 3.2, carbsG: 17, fatG: 1.2 },
  { key: "tortitas-arroz", name: "Tortitas de arroz", group: "CARB", unitGrams: 9, kcal: 387, proteinG: 8, carbsG: 82, fatG: 2.8 },

  // Vegetables
  { key: "brocoli", name: "Brócoli", group: "VEGETABLE", kcal: 34, proteinG: 2.8, carbsG: 7, fatG: 0.4 },
  { key: "espinacas", name: "Espinacas", group: "VEGETABLE", kcal: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4 },
  { key: "judias-verdes", name: "Judías verdes", group: "VEGETABLE", kcal: 31, proteinG: 1.8, carbsG: 7, fatG: 0.1 },
  { key: "calabacin", name: "Calabacín", group: "VEGETABLE", kcal: 17, proteinG: 1.2, carbsG: 3.1, fatG: 0.3 },
  { key: "berenjena", name: "Berenjena", group: "VEGETABLE", kcal: 25, proteinG: 1, carbsG: 6, fatG: 0.2 },
  { key: "pimiento", name: "Pimiento", group: "VEGETABLE", kcal: 31, proteinG: 1, carbsG: 6, fatG: 0.3 },
  { key: "tomate", name: "Tomate", group: "VEGETABLE", kcal: 18, proteinG: 0.9, carbsG: 3.9, fatG: 0.2 },
  { key: "lechuga", name: "Lechuga", group: "VEGETABLE", kcal: 15, proteinG: 1.4, carbsG: 2.9, fatG: 0.2 },
  { key: "zanahoria", name: "Zanahoria", group: "VEGETABLE", kcal: 41, proteinG: 0.9, carbsG: 10, fatG: 0.2 },
  { key: "cebolla", name: "Cebolla", group: "VEGETABLE", kcal: 40, proteinG: 1.1, carbsG: 9.3, fatG: 0.1 },
  { key: "champinones", name: "Champiñones", group: "VEGETABLE", kcal: 22, proteinG: 3.1, carbsG: 3.3, fatG: 0.3 },
  { key: "esparragos", name: "Espárragos", group: "VEGETABLE", kcal: 20, proteinG: 2.2, carbsG: 3.9, fatG: 0.1 },
  { key: "coliflor", name: "Coliflor", group: "VEGETABLE", kcal: 25, proteinG: 1.9, carbsG: 5, fatG: 0.3 },
  { key: "pepino", name: "Pepino", group: "VEGETABLE", kcal: 15, proteinG: 0.7, carbsG: 3.6, fatG: 0.1 },

  // Fruit
  { key: "manzana", name: "Manzana", group: "FRUIT", unitGrams: 180, kcal: 52, proteinG: 0.3, carbsG: 14, fatG: 0.2 },
  { key: "platano", name: "Plátano", group: "FRUIT", unitGrams: 120, kcal: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3 },
  { key: "naranja", name: "Naranja", group: "FRUIT", unitGrams: 200, kcal: 47, proteinG: 0.9, carbsG: 12, fatG: 0.1 },
  { key: "pera", name: "Pera", group: "FRUIT", unitGrams: 180, kcal: 57, proteinG: 0.4, carbsG: 15, fatG: 0.1 },
  { key: "fresas", name: "Fresas", group: "FRUIT", kcal: 32, proteinG: 0.7, carbsG: 7.7, fatG: 0.3 },
  { key: "arandanos", name: "Arándanos", group: "FRUIT", kcal: 57, proteinG: 0.7, carbsG: 14, fatG: 0.3 },
  { key: "kiwi", name: "Kiwi", group: "FRUIT", unitGrams: 75, kcal: 61, proteinG: 1.1, carbsG: 15, fatG: 0.5 },
  { key: "melon", name: "Melón", group: "FRUIT", kcal: 34, proteinG: 0.8, carbsG: 8, fatG: 0.2 },
  { key: "sandia", name: "Sandía", group: "FRUIT", kcal: 30, proteinG: 0.6, carbsG: 7.6, fatG: 0.2 },
  { key: "uvas", name: "Uvas", group: "FRUIT", kcal: 69, proteinG: 0.7, carbsG: 18, fatG: 0.2 },
  { key: "melocoton", name: "Melocotón", group: "FRUIT", unitGrams: 150, kcal: 39, proteinG: 0.9, carbsG: 10, fatG: 0.3 },
  { key: "aguacate", name: "Aguacate", group: "FAT", unitGrams: 200, kcal: 160, proteinG: 2, carbsG: 8.5, fatG: 15 },

  // Dairy
  { key: "leche-entera", name: "Leche entera", group: "DAIRY", kcal: 61, proteinG: 3.2, carbsG: 4.8, fatG: 3.3 },
  { key: "leche-desnatada", name: "Leche desnatada", group: "DAIRY", kcal: 34, proteinG: 3.4, carbsG: 5, fatG: 0.1 },
  { key: "yogur-natural", name: "Yogur natural", group: "DAIRY", unitGrams: 125, kcal: 61, proteinG: 3.5, carbsG: 4.7, fatG: 3.3 },
  { key: "yogur-griego", name: "Yogur griego", group: "DAIRY", unitGrams: 150, kcal: 97, proteinG: 9, carbsG: 4, fatG: 5 },
  { key: "queso-fresco", name: "Queso fresco batido", group: "DAIRY", kcal: 72, proteinG: 12, carbsG: 4, fatG: 0.5 },
  { key: "requeson", name: "Requesón", group: "DAIRY", kcal: 98, proteinG: 11, carbsG: 3.4, fatG: 4.3 },
  { key: "queso-curado", name: "Queso curado", group: "DAIRY", kcal: 390, proteinG: 25, carbsG: 1.4, fatG: 32 },
  { key: "bebida-soja", name: "Bebida de soja", group: "DAIRY", kcal: 43, proteinG: 3.3, carbsG: 2.6, fatG: 1.8 },

  // Fat
  { key: "aceite-oliva", name: "Aceite de oliva virgen extra", group: "FAT", kcal: 884, proteinG: 0, carbsG: 0, fatG: 100 },
  { key: "almendras", name: "Almendras", group: "FAT", kcal: 579, proteinG: 21, carbsG: 22, fatG: 50 },
  { key: "nueces", name: "Nueces", group: "FAT", kcal: 654, proteinG: 15, carbsG: 14, fatG: 65 },
  { key: "cacahuetes", name: "Cacahuetes", group: "FAT", kcal: 567, proteinG: 26, carbsG: 16, fatG: 49 },
  { key: "crema-cacahuete", name: "Crema de cacahuete", group: "FAT", kcal: 588, proteinG: 25, carbsG: 20, fatG: 50 },
  { key: "aceitunas", name: "Aceitunas", group: "FAT", kcal: 145, proteinG: 1, carbsG: 3.8, fatG: 15 },

  // Other
  { key: "proteina-suero", name: "Proteína de suero en polvo", group: "PROTEIN", unitGrams: 30, kcal: 380, proteinG: 78, carbsG: 8, fatG: 4 },
  { key: "chocolate-negro", name: "Chocolate negro 85%", group: "OTHER", kcal: 592, proteinG: 10, carbsG: 20, fatG: 50 },
  { key: "miel", name: "Miel", group: "OTHER", kcal: 304, proteinG: 0.3, carbsG: 82, fatG: 0 },
  { key: "hummus", name: "Hummus", group: "OTHER", kcal: 166, proteinG: 8, carbsG: 14, fatG: 10 },
  { key: "gazpacho", name: "Gazpacho", group: "OTHER", kcal: 37, proteinG: 0.8, carbsG: 4, fatG: 2 },
];

const BY_KEY = new Map(FOODS.map((food) => [food.key, food]));

export function findFood(key: string | undefined): CatalogueFood | null {
  return key ? (BY_KEY.get(key) ?? null) : null;
}

export type Macros = {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

const ZERO_MACROS: Macros = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * What `grams` of a catalogue food contributes. Zero for an unknown key.
 *
 * All three macros, not just protein: the table has carried `carbsG` and
 * `fatG` since the catalogue shipped and nothing read them, so a specialist
 * distributing macros saw one of the three.
 */
export function macrosFor(key: string | undefined, grams: number): Macros {
  const food = findFood(key);
  if (!food || !Number.isFinite(grams) || grams <= 0) {
    return { ...ZERO_MACROS };
  }
  const factor = grams / 100;
  return {
    kcal: Math.round(food.kcal * factor),
    proteinG: round1(food.proteinG * factor),
    carbsG: round1(food.carbsG * factor),
    fatG: round1(food.fatG * factor),
  };
}

export const FOODS_BY_GROUP = FOOD_GROUPS.map((group) => ({
  group,
  foods: FOODS.filter((food) => food.group === group),
})).filter((entry) => entry.foods.length > 0);
