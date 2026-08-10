# Slice 9 - Targets & daily check-in

Status: in progress. Context: **Monitoring** + first prescribe→track→review
loop (docs/build/roadmap-feature-tiers.md Tier 1). Owner picked this slice
2026-08-10.

## Problem

The specialist has no way to prescribe measurable targets, and the patient has
no daily anchor. FitOdds reference: "Your plan" (kcal / protein g / sessions
per week) + "Due today" checklist (weight, protein).

## Domain

- `PatientTarget` - one per patient, org-scoped, **set by the specialist**
  (this is a clinical prescription surface, unlike the patient-owned
  MedicationPlan): `kcalTarget`, `proteinTargetG`, `sessionsPerWeek` - all
  optional ints. Editable; event `TargetsSet`.
- `Measurement.kind` gains `PROTEIN` (grams per entry, multiple entries per
  day sum up). Append-only as ever; event `ProteinRecorded`.
- No new pure-logic module: the daily sum is one SQL aggregate.

## UI

- **Panel patient detail**: "Objetivos" card - form with the three numeric
  fields, save via org-scoped server action (nutritionist role only).
- **Patient `/mi-espacio`** (completed-assessment dashboard): "Hoy" card when
  targets exist - plan line (kcal · protein · sessions), weight row (done
  today ✓ / pending), protein row (today's grams / target, progress bar,
  quick-add grams form).

## Out of scope

Food photo logging, kcal tracking (no food log yet - kcal is display-only
reference), training session logging (Tier 3), reminders (Tier 1 email slice).

## Gates

tsc · lint · vitest · build; isolation test extended (targets + protein
cross-org); owner runs `npx prisma migrate dev --name targets_and_protein`.
