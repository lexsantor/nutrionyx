# Slice 8 - GLP-1 medication tracking

Status: in progress. Context: **Monitoring** ("medication adherence", docs/00 §3).
Owner decisions (2026-08-10, AskUserQuestion): GLP-1 first; **patient owns the
plan, specialist reads**; NORTE tokens (reference screenshots are feature input,
not visual identity); **no reminders in v1** (in-app next-dose card only).

## Problem

Patients on GLP-1 medication (semaglutide, tirzepatide, liraglutide,
orforglipron) must take a weekly or daily dose and rotate the injection site.
The specialist needs adherence visibility to interpret weight progress. Today
Nutrionyx captures medication only as free text in the assessment.

## Guardrail (regulatory)

Nutrionyx **never suggests doses or schedules**. The patient records the plan
their prescriber gave them. Copy states this explicitly. The nutritionist reads
plan + adherence; they never edit the plan (they do not prescribe). This keeps
the feature as monitoring, not medical-device territory (docs/00 §4).

## Domain

- `MedicationPlan` - one per patient (config, editable by the patient):
  drug name + optional generic, frequency (WEEKLY | DAILY), current dose mg,
  shot day (weekly only), active flag. Org-scoped.
- `MedicationDose` - append-only fact: drug, dose mg snapshot, injection site
  (6-point map: arms, belly, thighs), takenAt. Org-scoped. Never updated or
  deleted (PRD_03 rules 5-6), same pattern as `Measurement`.
- Events: `MedicationPlanSet`, `MedicationDoseLogged` (aggregate Patient).
- Pure logic in `src/modules/medication/schedule.ts`: next-dose date from plan +
  last dose; suggested next injection site (rotation order). Unit-tested.

## UI

- **Patient `/mi-espacio`**: medication card - next dose ("en X dias · miercoles"
  or "hoy"), current drug + dose, CTA to log; empty state links setup.
- **Patient `/mi-espacio/medicacion`**: setup/edit plan (preset drugs + manual,
  dose stepper, shot day) · log dose (dose prefilled, site picker over a body
  map with suggested site, date) · dose history (append-only list).
- **Specialist patient detail**: read-only "Medicacion (GLP-1)" card - plan
  summary, last dose + site, recent doses. Empty state when no plan.

## Out of scope (v1)

Reminders (email/push), camera body scan, Apple Health, 3D, photos, food/
protein logging, training log (future slices; see screens-ui-examples/).

## Gates

tsc · lint · vitest (schedule tests) · build; isolation integration tests
extended to medication repo functions; owner runs
`npx prisma migrate dev --name glp1_medication` on Neon.
