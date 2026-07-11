# Build Plan: Progress / Weight Log (Slice 2)

Status: approved 2026-07-11 (owner); built. Verification (migrate + gates + smoke) tracked in tasks/todo.md.
Created: 2026-07-11. Inputs: [Domain Model](../09_Domain_Model.md) (Measurement, Progress, Timeline; events WeightRecorded/GoalReached), [PRD_03](../PRD_03_Domain_Definition.md) (§3.4 Monitoring context, §3.6 append-only rules, §3.7 events), [User Journeys](../10_User_Journeys.md) (Journey 2 daily check-in, Journey 3 review), [design.md](../../design.md) §12 (data viz), LPEF [Prisma](https://github.com/lexsantor/lpef/blob/main/standards/stack-2026/prisma.md) and [Next.js](https://github.com/lexsantor/lpef/blob/main/standards/stack-2026/nextjs.md) standards.

## Problem (C1)

The Assessment is a one-shot snapshot. Nothing tracks weight over time, so a patient cannot see movement toward their goal and a nutritionist cannot review a trend. This slice turns the one-shot into an ongoing loop - the core of a nutrition-tracking product - by building the first piece of the specified-but-unbuilt Progress layer.

## Domain decision (C2/C3 - domain before schema)

- Introduce **Measurement** as an **append-only child of Patient** (Domain Model §Main Entities; not an aggregate root in either the 4-root or 7-root list, so this does not force the deferred 7-vs-4 reconciliation). Scope this slice to **weight only** (`Weight` value object); body measurements and photos are deferred.
- Emit **WeightRecorded** (already reserved, PRD_03 §3.7) into the existing append-only `domain_events` table, via the current typed helper.
- **Append-only + immutable** (PRD_03 §3.6 Rules 5-6): no edit or delete; a correction is a new record. Progress is **derived from history**, never a stored flag (Rule 8) - same discipline as the Assessment dashboard-unlock.
- **Domain language stays English** (Measurement, Weight, WeightRecorded). Spanish is UI-only; new UI strings to coin: "Peso", "Registrar peso", "Progreso". We deliberately avoid "meseta/racha/tendencia" and any dated weight projection - the reference-flow analysis rejected outcome projections as clinically irresponsible (C13).
- Aggregate-root note: a high-volume append-only child can later justify its own root; not pre-decided. If volume or query needs warrant it, we write a project ADR then. For a weight-only slice it stays a Patient child.

## Data model

`Measurement` (Prisma, org-scoped): `id`, `organizationId`, `patientId`, `kind` (enum `MeasurementKind` = WEIGHT for now), `value` (Decimal - kilograms when kind is WEIGHT), `recordedAt` (patient-provided date, defaults to now), `createdAt`. Index `(organizationId, patientId, recordedAt)`. No `updatedAt` - the row never changes.

The goal line comes from the latest COMPLETED assessment's `targetWeightKg` (already persisted); no new goal entity in this slice (GoalUpdated is out of scope).

## Vertical slice, in build order

1. Schema + migration: `Measurement` model, `MeasurementKind` enum. Owner runs `prisma migrate dev`.
2. `src/modules/measurement/` (LPEF AR1, Next.js R1): repository is org-scoped (Prisma R2) and append-only (create-only, like `DomainEvent`, Prisma R4). `recordWeight(params)` creates the row and appends `WeightRecorded`; `listWeights(organizationId, patientId)` returns history ascending.
3. Patient check-in (Journey 2, <2 min): on `/mi-espacio` after the assessment is COMPLETED, a lightweight "Registrar peso" form (weight + optional date) using the NORTE `Input`/`Button`, server action with typed `FormState` and logged failure paths (Next.js R2/R3).
4. Progress chart (design.md §12): a **dependency-free SVG line chart** (AR5 - no chart library for one chart) of weight over time; dashed goal line in `accent-text` labelled with the target; y-axis clamped to the relevant range (never zero); current point in `primary`, history in `surface-4`; **down toward the goal shown in success, away in warning** (inverted semantics); empty state "Registra tu primer peso" (never bare axes). Accessible: the chart is paired with a visually-hidden data table.
5. Nutritionist view: latest weight + delta-to-goal per patient in the `/panel` table (thin). A full nutritionist patient-detail progress view is a follow-up slice.
6. Tests (Prisma R5, EN2): measurement org-scoping isolation (org A cannot read/write org B's measurements) added to the CI-enforced integration test; append-only invariant (no update/delete path); `WeightRecorded` emitted once per record; unit test for delta-to-goal and the chart's y-range computation.

## Quality gates (done means all pass)

- Isolation + append-only + computation tests green in CI (the Postgres-backed job now runs integration tests on every push).
- Zero hardcoded UI strings (all copy via `messages/es.json`).
- Accessibility: form keyboard-operable and labelled; chart has an equivalent data table; reduced-motion respected.
- Chart honors §12: no zero baseline, dashed goal line, inverted success semantics, no projected/marketing curve (C13).
- Prisma migration reviewed; append-only, no destructive change.

## What this plan does NOT include

Body measurements, photos, medication/exercise adherence, moving-goal updates (GoalUpdated), the nutritionist patient-detail chart, messaging, and any outcome projection or trend-rate marketing (C13, rejected in the reference-flow analysis).

## Owner actions needed

1. Approve this plan (no code until then).
2. During build: run `prisma migrate dev` on your DB; smoke test the patient check-in + chart, and the nutritionist panel latest-weight column.

## Risks

- Chart scope creep: §12 is rich; this slice ships a single honest line chart with a goal line, not a full charting system.
- Decimal handling: weights are `Decimal` in Prisma; the chart and delta math must convert consistently (unit-tested).
