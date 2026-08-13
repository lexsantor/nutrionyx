# Nutrionyx Task Log

## Current state - RESUME HERE (updated 2026-08-12)

**Where we are:** the specialist portal is built through **Slice 21C**, on
`main`, CI green, deployed to Vercel. `origin/main` head at the time of
writing: `73f2180`. This is an LPEF reference project (governed by LPEF v0.2.0, see
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
  Body map: `BodyMapMeasures` draws 7 zone bands over clay mannequin
  renders (`public/mannequin-{male,female}-{front,back}.png`, Pletor
  nano-banana-2 + background removal). `sex` prop picks the figure from
  `Assessment.sex` (default male); per-sex band tables in the component,
  calibrated by measuring each render's alpha channel (scratchpad
  measure.py pattern - female hip/glute apex sits ~12 viewBox units
  lower).
- **Design audit 2026-08-11** (4 reviewers; .lexia-design/DESIGN-AUDIT.md):
  total 7.41 -> tier 1 applied (trust surface: legal pages + favicon +
  metadata + robots; dark variant fix; invite revalidation fix; Madrid
  "today" helpers; auth overflow; medication radio focus; hero highlight).
  Legal pages are PROVISIONAL: fiscal identification + lawyer review
  before commercial launch. Tier 2 applied (ease-house + 200ms default
  motion tier, primary #24405f with real chroma, el-bezel token,
  ink-tertiary deleted, body-map a11y/motion). Tier 3 applied (console
  route group panel/(console)/ with cached guard + persistent shell,
  patient-detail bento + Promise.all + bezel header, fetch uploads via
  UploadForm, wizard DOB/focus fixes, invite copy button). Tier 4
  applied (Reveal blur drop, thread scroll-to-newest + send announce,
  chart date anchors, admin two-step revoke + table wrapper, wizard
  pending label, stroke/touch-target/i18n residue). All four audit
  tiers done; estimated ~8.6-8.7 vs the 8.5 gate.
- **Autonomous backlog 2026-08-11**: password recovery on Neon Auth
  requestPasswordReset/resetPassword (emails sent by Neon, not Resend;
  UNTESTED end-to-end - needs a real inbox check), unsaved-changes
  guard on diet/routine editors (src/lib/use-unsaved-guard.ts),
  patient search + pagination (in-memory, SQL when caseloads grow),
  erase type-to-confirm, two-step photo/document deletes, Topbar skip
  link + id=contenido mains. General plugin learnings captured in
  lexia-design/LEARNINGS.md (37 rules for future plugin updates).
  Remaining backlog NEEDS OWNER: Resend domain verification, patient
  self-booking (product decisions), Stripe billing, legal review,
  lexia re-score with real rendering.
- **Ponytail cleanup 2026-08-12** (commit 72383f2): vendored
  lexia-design/ deleted (plugin installs from GitHub 0.7.3; LEARNINGS.md
  ported upstream first), screens-ui-examples/ deleted from disk, 6 dead
  NORTE tokens + 10 dead es.json keys removed, BodySilhouette simplified
  (landing-only now). graphify knowledge graph in graphify-out/
  (gitignored, rebuild with /graphify; use /graphify query for codebase
  questions).
- **Slice 13 - Export & erasure GDPR** (docs/build/slice-13-plan.md):
  `GET /api/me/export` (patient JSON download, notes excluded - anotaciones
  subjetivas) + "Descargar mis datos" link; `erasePatient` = children
  hard-deleted + tombstone anonymization (row kept so role resolution stays
  patient - see plan for the escalation risk), best-effort auth
  removeMember, `PatientErased` event, destructive card with confirmation on
  patient detail. Isolation covers cross-org erase. No schema change.
- **Slice 14 - Progress photos** (docs/build/slice-14-plan.md): private Blob
  store `nutrionyx-private` (store_d5EPcKBZ36Q4hyw6); `PatientPhoto` rows +
  auth-gated `GET /api/photos/[id]` (patient owner or org nutritionist,
  admin 403); multipart upload route; patient card + panel grid; erasure
  covers photos. Migration `patient_photos` applied.
  Store connected 2026-08-10 with env prefix `PRIVATE_BLOB` (token env
  `PRIVATE_BLOB_READ_WRITE_TOKEN`), verified end-to-end (direct URL fetch
  403), production redeployed with the new env.
- **Slice 15 - Reporting-lite** (docs/build/slice-15-plan.md): 28-day
  adherence card on the patient detail (weight delta + count, protein days
  met/logged vs target, doses logged vs expected, active days). Pure logic
  in modules/reporting/adherence.ts (tested); new org-scoped
  `listMeasurementsSince` covered by isolation. No migration.

- **Slice 16 - Documents** (docs/build/slice-16-plan.md): `PatientDocument`
  on the private-Blob rail; specialist uploads/deletes on patient detail
  (PDF/JPG/PNG/WebP <= 10 MB), patient downloads read-only in /mi-espacio;
  auth-gated `GET /api/documents/[id]` (admin 403); erasure covers
  documents. Migration `patient_documents` applied.

- **Slice 17 - Diet plan v1** (docs/build/slice-17-plan.md): `DietPlan` as
  its own aggregate root (resolves the docs/09 reconciliation flag; PRD_03
  §3.5), 7-day x 5-Spanish-meals Json document, pure normalize/validate in
  modules/diet/plan.ts (tested); panel editor at
  `/panel/pacientes/[id]/dieta` + card on detail; patient weekly view at
  `/mi-espacio/dieta` (today highlighted, empty meals hidden, targets line),
  nav gains Dieta. Export includes it, erasure deletes it, isolation 18/18.
  Migration `diet_plans` applied. Owner decisions: no food DB, no recipes,
  no per-meal macros in v1.

- **Slice 18 - Training v1** (docs/build/slice-18-plan.md):
  `TrainingRoutine` (Exercise Program root, PRD_03 §3.5; 7 day-texts,
  empty = rest day) + append-only `TrainingSession` (one per day, double
  tap rejected). Panel editor `/panel/pacientes/[id]/entreno` + card;
  patient `/mi-espacio/entreno` (today first + marcar sesión + history),
  nav gains Entreno; 28-day report gains sessions vs sessionsPerWeek x 4
  and sessions count as active days. Export + erasure + isolation (19/19).
  Migration `training` applied. Available to every specialist (adr/0006:
  sub-role is emphasis, not access).

- **Slice 19 - Messaging v1** (docs/build/slice-19-plan.md): async thread
  per patient (`Message`, mark-all-read via `readAt`, no edit/delete);
  patient `/mi-espacio/mensajes` + nav; panel thread at
  `/panel/pacientes/[id]/mensajes`, unread badges on the pacientes list
  (groupBy) and detail card; specialist→patient send fires a no-content
  email nudge. Export + erasure + isolation (20/20). Migration `messaging`.

- **Slice 20 - Agenda v1** (docs/build/slice-20-plan.md): specialist-managed
  `Appointment` (presencial/video + link, cancel keeps the row); `/panel/
  agenda` (console nav gains Agenda, upcoming grouped by day + nueva cita);
  patient "Próximas citas" card. **Timezone decision**: next-intl renders
  Europe/Madrid everywhere; inputs parsed via modules/scheduling/time.ts
  (CET/CEST tested). Daily cron also emails tomorrow's cita reminders.
  Export + erasure + isolation (21/21). Migration `appointments`.

- **Slice 21 - Diet and training week editors v2**
  (docs/build/slice-21-plan.md). **A**: a meal is rows of cantidad + alimento
  with numbered alternatives, not one free-text box (`DietPlanContent v2`).
  **B**: `DietTemplate` / `TrainingTemplate`, org-scoped, unique on
  `(organizationId, name)` so re-saving a name overwrites it; the shared
  `components/template-bar.tsx` serves both editors. Loading replaces the week
  behind an arm/confirm. **C**: a routine day is a list of exercises with
  series, repetitions and an optional cue; the exercise is picked from the
  catalogue in `modules/training/exercises.ts` (`key` = identity, `name`
  resolved from it on every read), so only series and reps are typed. Both
  slices lift their v1 documents, drop blank rows and reject cap breaches
  rather than truncating. Migration `diet_and_training_templates`.
  **Left**: D (exercise illustrations, `ILLUSTRATED` still empty - see the
  Pletor protocol in the plan) and E (print/PDF routes for both).

- **Slice 22 - Biblioteca** (navigation audit tier 1): `/panel/biblioteca` gives
  the consulta's saved weeks a door of their own. Lists diet and training
  templates with day/entry counts, renames, duplicates (`nextCopyName` picks a
  free name so the upsert cannot eat the source), deletes, and previews the
  week in a native `<details>`. Nav gains Biblioteca.
  **Two bugs found by verifying it end to end**: saving a week as a template
  had never worked, because `TEMPLATE_NAME_MAX` was exported from a
  `"use client"` module and `slice(0, <client reference>)` returns ""; and the
  isolation suite never cleaned up template rows (no FK to Organization).

- **Slice 23 - Bandeja de mensajes** (navigation audit tier 2):
  `/panel/mensajes` lists every thread with activity, unread first then by
  recency, one line of preview, linking into the patient thread. `listInbox`
  is two queries plus the unread counts, bounded by patients-who-wrote rather
  than by message count. Nav gains Mensajes.
  **Not done on purpose**: an unread badge on the sidebar entry. The shell is
  a client component and would need the count threaded through the console
  layout; the page itself already answers the question.

- **Slice 24 - Patient IA** (navigation audit tier 2): `/mi-espacio/progreso`
  (weight history + chart + list, body composition, photos) and
  `/mi-espacio/perfil` (my data, my assessment, documents, export, erasure
  route, sign out). `/mi-espacio` keeps only "hoy": check-in, protein, next
  dose, next appointment. 521 -> 282 lines and four queries removed from the
  highest-traffic patient screen. New guard `lib/auth/patient.ts` mirrors
  `requireSpecialistOrg`. **Decision**: erasure is explained and routed to
  the specialist, not a button - the consulta is the controller.
  **Regression caught on the rendered page**: the trim first put
  `WeightCheckIn` inside the targets tile, so a patient with no targets set
  lost every way to log weight. The "hoy" tile is unconditional now.

- **Slice 25 - One shell, and the mobile tier-1 fixes** (state audit
  2026-08-12): `components/app-shell.tsx` serves both areas; the patient space
  loses the legacy Topbar and gains a layout with `requirePatient`. Then the
  two blocking findings from walking 36 route/viewport combinations as both
  roles: the routine row wraps below `sm` (the exercise picker measured 18px
  at 390px, 292px after) and the weight table drops its `min-w-80`.
  Also fixed: the profile's "ver mis respuestas" pointed at
  `/mi-espacio/evaluacion`, which redirects a completed assessment away; the
  answers render in the profile now.
  Tier 2 done in the same pass: the invite form's h3 becomes an h2 (no
  skipped level on /panel/pacientes), the profile's clashing "Mis datos" /
  "Mis datos personales" become "Mi cuenta" / "Privacidad", and the inbox
  stamps today's threads with a time instead of a date.
  Tier 3 done: `/admin` gets the shared shell and splits into resumen /
  consultas / auditoría / códigos, with the platform-admin guard in the
  layout. `/admin/auditoria` reads `DomainEvent` for the first time, filtered
  by consulta, type and window, all in the URL.
  **Payloads are never selected**: several carry clinical values (BMI,
  measured perimeters, drug name and dose, email), and adr/0004's
  operator-blindness forbids this area seeing them.
  **Not built, on purpose**: suspending a consulta (needs a status column and
  a migration, for one consulta) and a separate user-lookup page.
  **Unverified**: the browser walk. `superadmin.email` is empty in the
  credentials file, so there is no way to sign in as platform-admin.
  **Open decision**: events should probably stop storing values at all.
  `modules/events` says payloads carry ids; several call sites disagree.
  Changing them forward is easy; the stored history is a separate question.

### Navigation audit (2026-08-12)

[docs/build/navigation-audit.md](../docs/build/navigation-audit.md) compares the
three navigations against docs/07 and the domain model. Verified gaps, in
sequence: (1) `/panel/biblioteca` so templates have a door at all, (2)
`/panel/mensajes` inbox, (3-5) `/mi-espacio/progreso` + `/perfil` + trim the
patient home, (6) admin shell with consulta detail, (7) `/admin/auditoria`
so `DomainEvent` becomes readable. Rule adopted: no nav entry without a
screen behind it.

- **Slice 26 - Print / PDF** (slice-21-plan slice E, the last of the original
  ask): `/imprimir/dieta/[id]` and `/imprimir/entreno/[id]`, outside /panel so
  the console shell is not in the document. No PDF dependency: `@page` plus a
  print media block (black on white, no shadows, day blocks unbreakable) and
  the browser's own "Save as PDF". Rest days and empty days are skipped. The
  routine sheet carries the exercise illustrations.
  **Two bugs it surfaced**, both fixed: saving a week as a template blanked
  every uncontrolled cell (React 19 resets the form on success too, and the
  editors only re-hydrated on error), and echoing the values back was not
  enough because `defaultValue` is read once at mount, so the form now carries
  a generation key that remounts the cells per action.

### Backlog - waiting on the owner

- **Exercise illustrations**: 4 of 41 drawn (press-banca, sentadilla,
  press-militar, dominadas). Peso muerto and curl de bíceps were generated
  wrong and never redone. **No credits** (4 left, ~9 per exercise), so this
  is parked until the balance is topped up. Recipe and `ILLUSTRATED` gate are
  in `modules/training/exercises.ts`.
- **Custom Select / DatePicker / TimePicker** (owner: important for visual
  cohesion, agreed to build). A native control's popup is drawn by the OS and
  no CSS reaches it, so this means owning a listbox and a date picker:
  keyboard, typeahead, focus return, screen-reader semantics, and replacing
  the mobile wheel iOS and Android give away. Its own slice, with a plan
  first.

### Remaining

RBAC team members (deferred until a multi-staff consulta exists - YAGNI).
Next candidates: diet/training iteration (meal library, per-set logging,
preferences per adr/0002) · patient self-booking on the agenda · billing
(Tier E). Non-code: own domain + Resend verification (patient emails still
sandbox).

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
