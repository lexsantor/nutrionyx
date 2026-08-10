# Slice 18 - Training v1 (routine + session log)

Status: in progress. Tier 3. Owner decision (2026-08-10): routine
prescription + "session done" logging; per-set logging (FitOdds style)
deferred. Available to every specialist regardless of `specialtyType`
(config drives emphasis, not access - adr/0006).

## Domain

- `TrainingRoutine` - Exercise Program aggregate root (PRD_03 §3.5), same
  document pattern as DietPlan: one editable routine per patient, `content`
  = 7 day-texts (empty = rest day), title + general notes. Event
  `RoutineSaved`.
- `TrainingSession` - append-only fact: the patient marks a session done
  (optional note, one per calendar day - a double tap is rejected). Event
  `SessionLogged`.

## UI

- **Panel** `/panel/pacientes/[id]/entreno`: 7-textarea editor; card on the
  patient detail (state + CTA). 28-day report gains a training row:
  sessions logged vs expected (sessionsPerWeek x 4, when the target
  exists); sessions also count as active days.
- **Patient** `/mi-espacio/entreno`: routine view (today highlighted, rest
  days shown as such) + "Marcar sesión de hoy" with optional note + recent
  sessions. Nav gains Entreno.

## Also

Export includes routine + sessions; erasure deletes both; isolation covers
both. Migration `training`.
