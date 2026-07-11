# Build Plan: Patient detail route (read-only clinical view) (Slice 7)

Status: built - pending owner gates. Created: 2026-07-11.
Inputs: [Vision](../00_Vision_and_Target_Architecture.md) (Patient Management), [adr/0005](../../adr/0005-adopt-pulse-crm-ui.md) (Pulse patterns), Slice 2 (measurements/chart), Slice 5 (console shell).

## Problem (C1)

`/panel/pacientes` is a flat table with nowhere to go: a specialist cannot open
a patient. The patient detail view is the specialist's core daily surface and the
anchor everything later hangs off (a plan, message or appointment is attached to
a patient from here). This slice adds a read-only clinical view. No new data.

## Scope

- A **route** `/panel/pacientes/[id]` (not a client drawer): deep-linkable,
  server-rendered, uses the canonical console layout, no client state.
- Read-only view from existing data: patient identity + status, the latest
  assessment (BMI + category, target/height, sex, age, activity, goals,
  conditions, allergies, medication), and the weight history chart (reused from
  Slice 2).
- Rows in the patients table link to the detail route.

## Domain / data (no schema change)

- `getPatientDetail(organizationId, patientId)` (patient repo): patient + latest
  assessment, **org-scoped** - the id is matched together with the session's
  organizationId, so another consulta's patient resolves to null → 404.
- Reuses `listWeights` (org-scoped) and the `WeightChart` component, moved from
  `app/mi-espacio/` to `components/weight-chart.tsx` so both the patient area and
  the specialist detail share it.

## Build order (done)

1. Move `WeightChart` to `components/`; update the mi-espacio import.
2. `getPatientDetail` (org-scoped) in the patient repo.
3. `/panel/pacientes/[id]/page.tsx` under `ConsoleShell`: header + clinical
   summary card + weight card; `notFound()` when out of scope.
4. Link patient names in the table to the detail route.
5. Extend the CI isolation test: `getPatientDetail` cross-tenant returns null.
6. es-only i18n (`patientDetail`), reusing `wizard.options.*` for enum labels.

## Quality gates

- `getPatientDetail` is org-scoped (isolation test extended; A cannot open B's
  patient).
- Read-only: no mutations, no clinical writes from this surface.
- Zero hardcoded strings; `tsc` + `lint` + `build` + `test:integration` green.

## What this plan does NOT include

Editing clinical data, notes, plans, messaging, appointments, documents,
per-sub-role divergence of the detail view - all later slices.

## Owner actions

1. Repair sandbox-touched `node_modules` first: `npm install` (a prior in-session
   `npm ci` was interrupted and left it partial).
2. Run gates + `test:integration` (with `DATABASE_URL` set so the isolation suite
   runs); smoke: open a patient from the table, verify the clinical summary and
   the weight chart, and that a foreign/typo id 404s.

## Risks

- Reused `WeightChart` move: the only structural change to existing code; the
  mi-espacio import was updated in the same commit.
