# Slice 17 - Diet plan v1 (weekly structured)

Status: in progress. Tier 3 first bet. Owner decisions (2026-08-10,
AskUserQuestion): weekly structured plan (no food DB, no recipes, no
shopping list); 5 fixed Spanish meals per day, empty ones hidden from the
patient; no per-meal macros (daily targets already live in PatientTarget
and render next to the plan).

## Domain decision (resolves the docs/09 flag)

PRD_03 §3.5 lists Diet Plan as an aggregate root; docs/09 held it as a
child of Treatment and flagged the reconciliation "decide when built".
Decision: **own aggregate root**, org+patient scoped, same shape as
MedicationPlan (Treatment does not exist as a built context and nothing
needs it yet). Food preferences (adr/0002) will live in this context when
they are captured - nothing in this slice blocks that.

## Model

`DietPlan` - one per patient, editable by the specialist (config; edit
history via `DietPlanSaved` events, full versioning deferred):
title?, notes? (general guidance), `content` Json, updatedByAuthUserId.

`content` = { days: 7 x { BREAKFAST | MID_MORNING | LUNCH | SNACK |
DINNER -> text } } - always read and written as a whole document, so one
Json column beats 35 rows.
ponytail: normalize to DietPlanMeal rows if per-meal queries ever exist.
Validation (trim, max lengths, drop unknown keys) is pure and tested in
`modules/diet/plan.ts`.

## UI

- **Panel** `/panel/pacientes/[id]/dieta`: 7x5 editor (textareas), title +
  general notes, one save action (whole document). Card on the patient
  detail linking in (state + last edit).
- **Patient** `/mi-espacio/dieta`: clean weekly view, today highlighted,
  empty meals hidden; daily targets line on top. Nav gains "Dieta".

## Also

Export route includes the plan; erasure deletes it; isolation covers
`getDietPlan`. Migration `diet_plans`.
