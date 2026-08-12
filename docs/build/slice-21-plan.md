# Slice 21 — Structured diet plans, routine exercises, templates and print

Status: PLAN ONLY (owner asked for the action plan, not the build).
Date: 2026-08-12.

## What was asked

1. Diet editor:each meal gets **rows of (cantidad, alimento)** instead of one
   free-text box, with **"añadir otro alimento"** (adds a row) and
   **"añadir alternativa"** (adds a numbered alternative version of that
   meal, with its own rows). Reference wireframe: three states — default,
   after adding a food, after adding an alternative.
2. **Save the whole week as a template**, loadable into any patient's plan
   later ("ya sea este usuario u otro").
3. Same treatment for the **training routine**, plus **exercise images**
   with a coherent look (one figure performing every exercise).
4. **See how the diet and routine PDFs look.**

## What exists today

- `DietPlanContent = { days: Partial<Record<MealSlot, string>>[] }` — one
  free-text string per meal, 5 slots, 7 days (`src/modules/diet/plan.ts`).
- `RoutineContent = { days: string[] }` — one free-text string per day
  (`src/modules/training/routine.ts`).
- Editors are 138 / 127-line server-action forms with fixed field names
  (`meal-${day}-${slot}`, `day-${index}`).
- No template model. No PDF or print path anywhere. No exercise assets.
- 4 mannequin renders in `public/` (male/female × front/back), produced
  via Pletor with a reference-image chain for style consistency.
- **Pletor balance: 64 credits.** At ~12 credits per 2K image that is
  ~5 images. This is the binding constraint on point 3 (see Slice D).

## Decisions to make before building (owner)

**D1 — `cantidad` type.** The wireframe labels it "CANTIDAD (GR)", but real
plans say "1 pieza", "2 cucharadas". Options: (a) free-text string capped
at ~16 chars, label "Cantidad", accepts "150 g" and "1 ud" — flexible, not
summable; (b) numeric grams only — summable later (macros, totals), but
forces every food into grams. Recommendation: **(a)** now, since nothing
in the product sums food quantities yet; (b) is a migration away if macro
totals ever land.

**D2 — template scope.** "este usuario u otro" = any patient **within the
same consulta**. Cross-org templates would break tenant isolation
(LPEF Prisma R2/R4, `isolation.integration.test.ts`) and will not be
built. Confirm that org-scoped is what you meant.

**D3 — exercise image budget.** 64 credits ≈ 5 images. A useful starter
library is 20-40 exercises. Options: (a) generate 5 now as a consistency
proof, ship the rest as credits allow; (b) top up credits first and
generate a 24-exercise set in one pass; (c) ship the schema with an
optional `imageKey` and no images at all until later. Recommendation:
**(a)** — proves the visual language works before spending more.

## Slices, in dependency order

### Slice A — Diet content v2 (structured rows + alternatives)

Data shape (`src/modules/diet/plan.ts`):

```ts
type FoodRow = { amount: string; food: string };
type Meal = { main: FoodRow[]; alternatives: FoodRow[][] };
type DietPlanContent = { version: 2; days: Partial<Record<MealSlot, Meal>>[] };
```

- `normalizeContent` accepts **both** shapes: a v1 string becomes
  `{ main: [{ amount: "", food: text }], alternatives: [] }`. No data
  migration script, no destructive rewrite — the existing patient's plan
  keeps rendering, and upgrades to v2 the first time it is saved.
- Caps: rows per meal, alternatives per meal, `food` length, `amount`
  length. Reject beyond, do not silently truncate.
- Editor becomes a client component with row state. Field naming needs to
  survive a server action: `meal-${day}-${slot}-${group}-${row}-amount`
  where `group` is `main` or `alt${n}`. The existing React-19 reset
  hydration (`values` echoed on error) must be extended to the new names.
- Patient view (`/mi-espacio/dieta`) renders quantity + food and labels
  alternatives clearly — a patient must never mistake an alternative for
  an addition.
- Tests: normalize round-trip, v1→v2 upgrade, caps, `isEmptyPlan`.

Risk: this is the largest single piece. The editor stops being a dumb
form and becomes stateful; that is where the bugs will be.

### Slice B — Diet templates

```prisma
model DietTemplate {
  id                  String   @id @default(cuid())
  organizationId      String
  name                String
  content             Json
  createdByAuthUserId String
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  @@index([organizationId])
  @@map("diet_templates")
}
```

- Org-scoped on every query (D2). Event on create/delete, per the
  append-only audit convention (`appendEvent`).
- Editor gains: "Guardar semana como plantilla" (name prompt) and "Cargar
  plantilla" (list → replaces the week, with an explicit confirm since it
  overwrites unsaved edits — the unsaved-changes guard already exists).
- Migration: `npx prisma migrate dev --name diet_templates` (owner runs).

### Slice C — Training content v2

```ts
type Exercise = {
  key?: string; name: string; sets: string; reps: string;
  notes?: string;
};
type RoutineContent = { version: 2; days: { exercises: Exercise[] }[] };
```

- Same v1→v2 tolerance as Slice A (a day's string becomes one exercise
  with that text as `name`).
- Same editor pattern: add/remove exercise rows per day.
- `TrainingTemplate` model mirroring `DietTemplate`.
- `key` references the catalogue (brought forward from Slice D): the
  editor picks the exercise instead of typing it, `name` is resolved from
  the catalogue, and only series and repetitions stay free text. A key
  that no longer resolves is dropped and the stored name carries the row,
  so a routine without images renders fine.

### Slice D — Exercise image library (credit-bound)

- Catalogue in code (`src/modules/training/exercises.ts`): slug, Spanish
  name, muscle group. Shipped with Slice C — the editor already picks
  from it. Keys are append-only: renaming a `name` updates every routine,
  changing a `key` orphans them.
- `ILLUSTRATED` gates which keys have a file in `public/exercises/`; an
  exercise not listed there renders no image, never a broken one.
- Generation protocol, same as the mannequins: the existing
  `public/mannequin-male-front.png` is passed as `reference_image_ids` on
  every request so material, lighting and framing stay identical across
  the set. Background removal, resize to ~800px, `public/exercises/`.
- First batch of 5 (D3a): sentadilla, press banca, remo, peso muerto,
  zancada. ~60 credits. Review consistency before spending more.

### Slice E — Print / PDF for diet and routine

- **No new dependency.** `@react-pdf/renderer` and headless-Chrome PDF are
  both heavier than the problem: a dedicated print route plus a print
  stylesheet gives a real PDF through the browser's own "Guardar como PDF",
  works on every platform, and is ~1 file per document.
- Routes: `/panel/pacientes/[id]/dieta/imprimir` and `.../entreno/imprimir`
  (specialist), plus the patient's own copy from `/mi-espacio/dieta` and
  `/mi-espacio/entreno`.
- Print CSS: `@page { size: A4; margin: 14mm }`, no shell, no nav, black
  on white, page-break-inside avoid per day block, patient name + plan
  date in a running header. Exercise images print at a fixed small size.
- This is the fastest of the five and answers "quiero ver cómo queda"
  soonest — it can be built against the current v1 shapes and re-rendered
  once A and C land. **Suggested first if seeing the PDF is the priority.**

## Order and rough size

| Slice | Depends on | Size | Notes |
|---|---|---|---|
| A diet v2 | D1 | L | biggest; stateful editor + migration tolerance |
| B diet templates | A | M | one model, one migration, two buttons |
| C training v2 | A (pattern) | M | mirrors A, smaller surface |
| D exercise images | C, D3 | S build / credit-bound | 5 images ≈ 60 credits |
| E print/PDF | none (better after A+C) | S | zero deps, fastest visible result |

Two viable orders: **A → B → C → D → E** (finish each domain fully), or
**E(v1) → A → B → C → D → E(v2)** if seeing the PDF early matters more
than not doing E twice.

## Out of scope, stated

- Macro/calorie totals from quantities (needs D1 option b).
- A food database or autocomplete — the wireframe shows free text.
- Cross-consulta template sharing (D2, tenant isolation).
- Patient-side editing of plans; they stay read-only for patients.
