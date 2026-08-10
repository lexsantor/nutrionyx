# Nutrionyx Task Log

## Current state - RESUME HERE (updated 2026-07-11)

**Where we are:** the specialist portal is built through **Slice 7**, on `main`,
CI green, deployed to Vercel. `origin/main` head at the time of writing:
`dc25c4d`. This is an LPEF reference project (governed by LPEF v0.2.0, see
[../lpef.yml](../lpef.yml) and the repo [../CLAUDE.md](../CLAUDE.md)).

**Stack:** Next.js 16.2.10 (App Router, Turbopack) · React 19.2.4 · Tailwind 4
(CSS-first `@theme inline`, NORTE tokens in `src/app/globals.css`) · TypeScript
strict · Prisma 7.8 (`prisma-client` generator -> `src/generated/prisma`, driver
adapter `@prisma/adapter-pg`) · PostgreSQL on Neon · Neon Auth (Better Auth) ·
next-intl (es only, `messages/es.json`) · self-hosted fonts · Reicon icons
(`reicon-react`). Vitest for tests.

**Roles / tenancy:** `resolveUserRole` is platform-admin > patient >
nutritionist ([src/lib/auth/role.ts](../src/lib/auth/role.ts)). Every model is
org-scoped; the `organizationId` always comes from the session, never the client;
cross-tenant isolation is enforced by the CI integration test
([src/modules/isolation.integration.test.ts](../src/modules/isolation.integration.test.ts),
11 tests). **Operator-blindness** (adr/0004): the platform admin sees business
data only, never patient clinical data. A specialist also has a **sub-role**
`Organization.specialtyType` (DIETITIAN | SPORTS_NUTRITIONIST) that is
**configuration, not RBAC** (adr/0006).

### How we work (the cadence)

- Vision-led, **slice by slice**, evidence-gated (LPEF C2/C6; adr/0004). No
  big-design-up-front. Each non-trivial slice gets a plan in `docs/build/`.
- Product decisions and R9 sign-offs are the **owner's** - surface them with
  AskUserQuestion (recommended option first). Challenge decisions that violate a
  linked principle, citing the article/rule (C12).
- The agent writes code; the **owner runs the gates** on their Mac
  (`npx tsc --noEmit && npm run lint && npm test && npm run build` +
  `DATABASE_URL=... npm run test:integration`) and **migrations**
  (`npx prisma migrate dev --name ...`) - the sandbox cannot reach
  `binaries.prisma.sh`. The agent commits only on green; the **owner pushes**;
  the agent then verifies CI + the Vercel deployment (Vercel MCP).
- Capture every correction as a checkable rule in
  [lessons.md](lessons.md) - read it at session start.

### Gotchas (see lessons.md for the full rules)

- **Never run `npm ci` in the sandbox** - it wipes `node_modules`, which is the
  operator's real folder over the mount; an interrupted run corrupts it.
- **Lockfile is fragile**: before committing any `package-lock.json` change,
  grep that it contains `next-intl/node_modules/@swc/helpers` and `0.5.23`
  (a macOS `npm install` can drop it -> CI `npm ci` fails). If no dep changed,
  prefer `git checkout <good-commit> -- package-lock.json`.

### Built (slices)

- **M2 - Assessment**: identity spine (Neon Auth), org bootstrap + Prisma mirror,
  patient invite -> accept -> activate, assessment wizard (10 steps, versioning,
  capture-time guardrail, completion freeze + events), patient summary, panel
  metrics. NORTE design system + full token migration + dark mode.
- **Slice 2 - Progress**: append-only `Measurement` (weight), patient check-in,
  dependency-free SVG weight chart, panel latest-weight + delta.
- **Slice 3 - Platform Admin**: `PlatformAdmin` allowlist, `/admin` dashboard
  (counts-only, operator-blind), access-code generator/revoker.
- **Slice 4 - Consulta profile**: `Organization` profile fields + `/panel/ajustes`
  Settings (editable consulta name, self-service).
- **Slice 5 - Console (Pulse-adapted, adr/0005)**: sidebar shell, split into
  Inicio / Pacientes / Ajustes, `specialistDashboard` counts; Reicon icons;
  controls (Ajustes + theme switch + sign-out) at the sidebar bottom; canonical
  page layout (stable scrollbar gutter).
- **Slice 6 - Sub-role + consent (adr/0006)**: `specialtyType` (config, not RBAC)
  + append-only `ConsentRecord`; activation captures sub-role tiles + DPA consent
  (guarded); Ajustes edits sub-role + backfill soft-prompt; specialty badge on
  Inicio; org-scoped.
- **Slice 7 - Patient detail**: `/panel/pacientes/[id]` read-only clinical view
  (identity, latest assessment, weight chart), org-scoped `getPatientDetail`.
- **Slice 8 - GLP-1 medication** (docs/build/slice-8-plan.md): patient-owned
  `MedicationPlan` + append-only `MedicationDose` (injection-site rotation);
  `/mi-espacio/medicacion` (setup, dose log with body-map site picker, history)
  + next-dose card on the patient home; read-only medication card on the panel
  patient detail. Guardrail: Nutrionyx never suggests doses. Migration
  `glp1_medication` applied 2026-08-10; deployed and verified (CI + Vercel).
- **Slice 9 - Targets & daily check-in** (docs/build/slice-9-plan.md):
  `PatientTarget` (kcal/protein/sessions, specialist-prescribed, panel form on
  patient detail) + `Measurement` kind `PROTEIN`; patient "Hoy" card (plan
  line, weight-today status, protein progress + quick add). Feature roadmap in
  docs/build/roadmap-feature-tiers.md. Migration `targets_and_protein`
  applied 2026-08-10.
- **Slice 10 - Tier 1 batch** (docs/build/slice-10-plan.md): specialist-private
  append-only `PatientNote` + "Notas" card on patient detail; patient nav
  (Inicio · Medicación) in the Topbar (NavLink restored); consulta logo upload
  to Vercel Blob (store `nutrionyx-assets`, public, linked; `@vercel/blob`
  dep). Migration `patient_notes` applied 2026-08-10.
- **Slice 11 - Transactional email** (docs/build/slice-11-plan.md): Resend via
  direct account (marketplace Free checkout was broken), no SDK - one fetch in
  `src/lib/email.ts`. Invite email on `invitePatient` (best-effort); dose
  reminder cron 08:00 UTC (`vercel.json` → `/api/cron/reminders`, Bearer
  `CRON_SECRET`, event `MedicationReminderSent`). Guardrail: never clinical
  data in email bodies. `CRON_SECRET` set in all envs.
  `RESEND_API_KEY` set 2026-08-10; send verified in prod. Sender is the
  `onboarding@resend.dev` sandbox (delivers only to the owner's email) until
  a real domain is verified (`EMAIL_FROM` overrides).
- **Slice 12 - Body composition** (docs/build/slice-12-plan.md): Measurement
  kinds `WAIST_CM`/`HIP_CM`/`BODY_FAT_PCT`; generic `recordMetric` (weight/
  protein now thin wrappers); pure derivations in measurement/body.ts (ratio,
  fat/lean mass, tested); patient "Medidas" card + panel "Composición
  corporal" card. **Migration `body_metrics` pending on Neon.**
- **Slice 13 - Export & erasure GDPR** (docs/build/slice-13-plan.md):
  `GET /api/me/export` (patient JSON download, notes excluded - anotaciones
  subjetivas) + "Descargar mis datos" link; `erasePatient` = children
  hard-deleted + tombstone anonymization (row kept so role resolution stays
  patient - see plan for the escalation risk), best-effort auth
  removeMember, `PatientErased` event, destructive card with confirmation on
  patient detail. Isolation covers cross-org erase. No schema change.

### Migrations (applied on Neon)

`20260709134258_init`, `_specialist_access_codes`, `_measurements`,
`_platform_admin`, `_org_profile`, `20260711165233_specialty_and_consent`.

### Next candidates (owner picks)

- **Specialist notes** on a patient - first editable clinical datum, hangs off
  the patient detail (Slice 7). Small, high-value.
- **Real sub-role divergence** - per-role widgets/templates on the scaffold from
  Slice 6 (`src/modules/specialty/config.ts`).
- **Next PRD tier** as a slice - messaging, calendar, or plan builder (each a
  future bounded context in [../docs/00_Vision_and_Target_Architecture.md](../docs/00_Vision_and_Target_Architecture.md)).
- Deferred: real logo upload (Vercel Blob); patient/admin console shells (only
  the specialist area is migrated); billing (Tier E, Stripe) when monetizing.

### Where to look

- North star: [../docs/00_Vision_and_Target_Architecture.md](../docs/00_Vision_and_Target_Architecture.md);
  near-term sequence: [../docs/build/roadmap-platform-roles-billing.md](../docs/build/roadmap-platform-roles-billing.md).
- Decisions: [../adr/](../adr) (0001 es-UI, 0002 food prefs, 0003 access-code,
  0004 vision-led + operator-blindness, 0005 Pulse UI, 0006 sub-role + consent).
- Slice plans: `../docs/build/slice-*-plan.md`.
- Lessons: [lessons.md](lessons.md).

## Review

Adoption playbook (LPEF `playbooks/adopt-lpef.md`) executed first on 2026-07-09:
all DoD items passed. M2 closed; the platform vision (adr/0004) is being built
slice by slice. The reference build has stress-tested LPEF and is expected to
yield extractable standards (Next.js and Prisma standards already landed in LPEF
M3; entitlements + multi-tenant RBAC + EU health-data playbook are candidates).
