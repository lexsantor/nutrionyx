# Build Plan: Specialist shell + Inicio dashboard + Pacientes (Slice 5 / Roadmap Tier C+, on Pulse)

Status: pending owner review - no code until approved.
Created: 2026-07-11. Inputs: [adr/0005](../../adr/0005-adopt-pulse-crm-ui.md) (adopt Pulse), [roadmap](roadmap-platform-roles-billing.md), [Vision](../00_Vision_and_Target_Architecture.md), Pulse CRM (`dashboards/Pulse CRM Dashboard`, commercial license), LPEF Next.js/Prisma standards.

## Problem (C1)

The specialist portal is a single flat `/panel` (dashboard metrics + patients table + invite, all stacked) with a topbar-only shell. It doesn't scale to the vision (patients, scheduling, messaging, ...). Pulse gives a proven CRM shell and screens; this slice adopts the shell and splits the portal into real sections, rethemed to NORTE, on our backend.

## Scope

Adapt from Pulse (not paste; rethemed to NORTE, wired to our domain):

- **App shell**: a sidebar (Inicio · Pacientes · Ajustes) + header (consulta name, theme switch, outlined sign-out), as a Next layout wrapping the specialist routes. Adapted from Pulse `components/layout` (Sidebar/Header + their contexts); collapses to a top/bottom nav on mobile.
- **Route restructure** (specialist area):
  - `/panel` -> **Inicio**: dashboard metric cards - pacientes activos, nuevos (30 d), con cuestionario completado, pendientes de seguimiento - plus the existing completion-rate and median-time. Adapted from Pulse `dashboard/overview`.
  - `/panel/pacientes` -> **Pacientes**: the patients table (adapted from Pulse `CustomersTable`) + the invite form + a patient detail drawer (adapted from `CustomerDrawer`) + filter/search bar. The current panel's table/invite move here.
  - `/panel/ajustes` -> **Ajustes**: existing Settings, now under the shell.
- **No new dependencies** this slice (shell, tables, cards, drawer are Tailwind + our tokens). recharts is deferred to the slice that needs real charts.

## Domain / data

- New metrics function `specialistDashboard(organizationId)` (org-scoped, Prisma R2): active patients, new-in-30-days, with-completed-assessment, pending-follow-up (active + completed assessment + no weight logged in 14 days). Counts only.
- No schema change.

## Build order (incremental, each buildable)

1. Shell: sidebar+header layout (NORTE), wrap `/panel/*`; nav active states; mobile nav. Move theme switch + sign-out into the header.
2. Inicio: `/panel` becomes the dashboard (metric cards from `specialistDashboard`).
3. Pacientes: `/panel/pacientes` with the patients table + invite + detail drawer + search/filter; remove the table/invite from `/panel`.
4. Ajustes: reparent under the shell (mostly a move).
5. Retheme pass on every adapted component to NORTE tokens; es-only strings via `messages/es.json`.

## Quality gates

- `specialistDashboard` is org-scoped (extend the CI isolation test: a specialist's dashboard counts never include another org).
- Zero hardcoded strings; keyboard-accessible (sidebar, table, drawer); build + integration green.
- Adapted Pulse code refitted to our conventions (server components/actions, our tokens) - reviewed, not pasted.

## What this plan does NOT include

recharts/real charts, calendar/scheduling, messaging, command palette, the patient/admin shells (only the specialist area), and any Pulse mock-data or phosphor-icons deps.

## Owner actions

1. Approve.
2. Run gates + `test:integration`; smoke the shell (Inicio/Pacientes/Ajustes nav), the dashboard metrics, and the patients table/drawer.

## Risks

- Big slice; built in the 5 steps above so each is verifiable. If a step balloons, it splits into its own commit.
- Shell replacing the topbar touches all specialist screens - patient (`/mi-espacio`) and admin (`/admin`) keep their current topbar for now; their shells come later.
