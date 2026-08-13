# Slice 29 — Foods and macros, thin slice

Date: 2026-08-13. Tier 2's deciding row
([roadmap-feature-tiers.md](roadmap-feature-tiers.md)): every product in the
reference class builds the diet plan on a food database and totals macros as
you type. Ours is free text with no totals.

## What exists

`DietPlanContent` v2 (`modules/diet/plan.ts`): each meal holds rows of
`{ amount: string; food: string }`, both free text, plus numbered
alternatives. The file already says what this slice is for:

> `amount` is free text ("150 g", "1 ud", "2 cucharadas"): plans are not
> summed anywhere, and forcing grams would exclude foods measured in pieces.
> Revisit if macro totals ever land.

`PatientTarget` already carries `kcalTarget` and `proteinTargetG`, prescribed
and shown on the patient's checklist. So the loop is half built: a target
exists, and nothing measures against it.

## The licence question, settled before writing code

Checked rather than assumed, because a food database is somebody's data:

- **USDA FoodData Central** — public domain, CC0. Commercial use free, no
  conditions. US foods.
- **CIQUAL** (ANSES, France) — Licence Ouverte, commercial use with
  attribution. European, good quality.
- **Open Food Facts** — ODbL, **share-alike**. Derivative databases must be
  published under the same licence. In a SaaS that mixes it with our own data
  this is a real risk, not a formality. **Avoid.**
- **BEDCA** (AESAN, Spain) — the obvious clinical choice for a Spanish
  consulta, 500 most-consumed foods, EuroFIR standards. **Its commercial terms
  I could not confirm**: there is a conditions-of-use PDF at
  `bedca.net/bdpub/UsoBD.pdf` that has to be read before anything imports it.
  Not a blocker for this slice, because this slice imports nothing.

## Decision: no import at all, yet

A curated catalogue in code, the same shape the exercise catalogue already
uses (`modules/training/exercises.ts`): a fixed list of keys with their
composition, versioned with the repo, no ingestion pipeline, no licence
exposure, no 10,000-row table to keep current.

Around 100-150 foods covers a Spanish consulta's ordinary week. Values sourced
from public-domain data (USDA) and checked against CIQUAL where they differ.

This is deliberately the smallest thing that closes the loop. If it proves
useful, the next slice is the real database, and by then the licence question
will have been answered on its own terms rather than under deadline.

## Shape

1. **`modules/diet/foods.ts`** — `{ key, name, group, per: "100g" | "unit",
   kcal, proteinG, carbsG, fatG }`. Pure data plus a lookup, no dependency.
2. **`FoodRow` gains two optional fields** — `foodKey?: string` and
   `grams?: number`. Optional is what keeps every plan written so far valid:
   a row with only `amount` and `food` still renders and still saves. A row
   that carries a key contributes to the day's totals.
3. **Totals per day** — kcal and protein, computed from the rows that carry a
   key, shown against `PatientTarget` where one exists. Carbs and fat are
   stored in the catalogue from the start but not surfaced: the product
   prescribes kcal and protein, and a number nobody prescribes is noise.
4. **The count of rows that carry no key is visible**, so a total is never
   read as complete when half the meal is free text. A silent partial sum is
   worse than no sum.

## What this slice is not

- Not micronutrients. Nutrium's automatic micro analysis is a different
  product; claiming it from a 150-food table would be a lie.
- Not a recipe model, not a shopping list, not exchanges.
- Not a barcode scanner or a branded-product database (that is where Open Food
  Facts would tempt, and where its licence bites).
- Not editing the catalogue from the UI. It ships with the repo, like the
  exercises.

## Risk

The honest one: a nutritionist may find 150 foods too few to be worth using,
and half-filled totals more annoying than none. That is the thing to check
with a real week before spending a slice on ingestion. Point 4 exists so the
gap is visible rather than papered over.
