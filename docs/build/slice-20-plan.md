# Slice 20 - Agenda v1 (citas gestionadas por consulta)

Status: in progress. Owner decision (2026-08-10): specialist-managed
appointments only - no availability windows, no patient self-booking, no
external calendar sync, no waitlist (Scheduling context grows later).

## Timezone decision

Single market (ES): next-intl now renders every date in Europe/Madrid
(`timeZone` in i18n/request.ts) and appointment inputs are parsed as
Madrid wall-clock via `modules/scheduling/time.ts` (pure, tested for CET
and CEST). ponytail: per-user timezones when a non-ES market exists.

## Domain

- `Appointment`: org-scoped, patientId, startsAt (UTC instant), durationMin,
  mode (IN_PERSON | VIDEO) + optional videoUrl, note, status (SCHEDULED |
  CANCELLED, cancelled rows kept for history). Events
  `AppointmentScheduled` / `AppointmentCancelled`.

## UI

- **Panel `/panel/agenda`** (console nav gains Agenda): upcoming
  appointments grouped by day (patient name, time, mode) + cancel; "Nueva
  cita" form (patient select, date, time, duration, mode, video link,
  note). Patient detail card lists the patient's upcoming citas.
- **Patient /mi-espacio**: "Próximas citas" card (date, time, mode, video
  link when set).

## Reminder

The existing daily cron (08:00 UTC) also emails patients with a cita
tomorrow (Madrid calendar day): time + modality only, no clinical content
(slice 11 guardrail).

## Gates

tsc · lint · vitest (time helper) · build; isolation (appointments
scoped); migration `appointments`.
