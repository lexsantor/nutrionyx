# Slice 12 - Body composition (manual)

Status: in progress. Tier 2 (roadmap-feature-tiers.md). FitOdds Body screen,
web-adapted: manual entries, no camera scan.

## Domain

- `MeasurementKind` gains `WAIST_CM`, `HIP_CM`, `BODY_FAT_PCT`. Same
  append-only `Measurement` rows (Decimal(5,1) fits all three).
- `recordMetric` generalizes the repository (recordWeight/recordProtein stay
  as thin wrappers - same API, no caller churn). Event per kind:
  `BodyMetricRecorded` payload { kind, value }.
- Pure derivations in `src/modules/measurement/body.ts` (+ tests):
  waist/hip ratio, fat mass kg (weight x pct), lean mass kg.

## UI

- **Patient /mi-espacio**: "Medidas" card under Progreso - three optional
  inputs (cintura cm, cadera cm, % graso), at least one required; latest
  values + derived ratio / fat / lean shown when computable.
- **Panel patient detail**: "Composición corporal" card - latest metrics with
  dates + derived values, read-only.

## Gates

tsc · lint · vitest · build; isolation covers the new latest-of-kind query;
owner runs `npx prisma migrate dev --name body_metrics`.
