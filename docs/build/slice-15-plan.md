# Slice 15 - Reporting-lite (28-day adherence)

Status: in progress. Tier 2. Reuses existing data only - no new capture.

## What the specialist sees

"Informe · últimos 28 días" card on the patient detail:

- **Peso**: delta in the window (first vs last entry) + entry count.
- **Proteína**: days logged, days meeting the target, daily average vs
  target (only when a protein target exists).
- **Medicación**: doses logged vs expected (weekly plan → 4, daily → 28)
  when a plan exists.
- **Actividad**: days with at least one record (any measurement or dose).

## Pieces

- Pure logic in `src/modules/reporting/adherence.ts` (+ tests): expected
  doses, protein day-buckets, activity days. Date math is local-time,
  consistent with the rest of the app.
- One new org-scoped query: `listMeasurementsSince(org, patient, kind,
  since)`; doses reuse `listDoses` filtered in memory. Isolation gets a
  cross-org case for the new query.
- Card is server-rendered on the patient detail; no client code.

## Out of scope

Org-level aggregate dashboards (panel home already counts), CSV/PDF export,
trends beyond 28 days, charts (the weight chart already exists).

## Gates

tsc · lint · vitest · build; no migration.
