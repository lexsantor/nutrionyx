# Nutrionyx Task Log

## M2 - Assessment slice (LPEF first reference build)

- [x] Adopt LPEF v0.2.0 (lpef.yml, router, deviations/) - playbook DoD verified 2026-07-09
- [x] Discovery material restored and committed; screenshots under docs/research/flows/
- [x] Discovery review of all 11 docs (findings: PR1 evidence gap, BU2 metric gap, 7-vs-4 aggregate root inconsistency, missing food vocabulary)
- [x] Reference flow analysis: docs/research/reference-flow-analysis.md (27 steps)
- [x] ADR-0001 Spanish UI + i18n day one; ADR-0002 food preferences ownership
- [x] Fix misnamed file: progreso-corporal.tsx.md -> 04_Product_Operating_Model.md
- [x] docs/discovery/assessment-slice.md
- [x] Owner inputs answered 2026-07-09: core clinical intake; InProgress->Completed; new version per repeat; 80% / 15 min
- [x] Domain delta: Assessment aggregate specified in 09_Domain_Model (aggregate-root reconciliation flagged, deferred to first Medication/DietPlan/Exercise slice)
- [x] Build plan against stack-2026 (docs/build/slice-1-plan.md, approved 2026-07-09)
- [x] Step 1: scaffold (Next 16.2.10, React 19.2.4, Tailwind 4, Prisma 7.8 client engine, Clerk, next-intl, Vitest), assessment computed module with 10 passing tests, Prisma schema (Organization, Patient, Assessment, DomainEvent), CI workflow. Verified: lint clean, tsc clean, 10/10 tests, build green.
- [ ] Confirm provisional guardrail thresholds with owner (info <5%, healthy 5-15%, aggressive >15% - src/modules/assessment/computed.ts)
- [x] Deviation 0001: Neon Auth replaces Clerk (owner decision 2026-07-09; first real deviation of the LPEF loop)
- [x] Step 2a: Neon Auth wired (@neondatabase/auth 0.4.2-beta): server/client instances, /api/auth handler, proxy.ts protection, sign-in/sign-up pages in es via next-intl. Verified: tsc, lint, 10/10 tests, build green.
- [x] Step 2b: org bootstrap (create + Prisma mirror + setActive), protected /panel with empty patients section, slugify with tests. Verified: tsc, lint, 15/15 tests, build green (7 routes).
- [ ] Owner: smoke test - sign-up, create organization, see /panel (requires migration below)
- [ ] Owner: run first migration on their Mac: `npx prisma migrate dev --name init` (sandbox cannot reach binaries.prisma.sh; prisma.config.ts loads .env.local)
- [x] Step 3: patient invitation -> activation. Invite form in /panel (Better Auth inviteMember role=member + Patient INVITED + PatientCreated event), pending-invitations list with shareable link, /auth/accept-invitation (sign-up redirect with safe returnTo, accept, authUserId link, ACTIVE), /mi-espacio patient landing. Verified: tsc, lint, 18/18 tests, build green (8 routes).
- [ ] Owner smoke: invite a second email, open the invitation link in an incognito window, accept, verify patient shows ACTIVE in /panel
- [ ] Optional (owner, Neon console): Auth -> Configuration -> enable "Verify email at signup", then Plugins -> Organizations -> enable "Send Invitation Email" for automatic emails
- [ ] Step 3: patient invitation -> activation
- [x] Step 4: assessment wizard - domain (definition/validation/versioning, 11 tests) + UI (10 steps, progress, resume, back nav)
- [x] Step 5: capture-time guardrail - live tiered banner on target weight, clinical-neutral copy
- [x] Step 6: completion (freeze + AssessmentCompleted event), patient summary with BMI/WHO category, panel assessment column
- [ ] Owner smoke: full patient journey (invite -> activate -> wizard -> complete -> both dashboards)
- [ ] Step 7: metrics instrumentation
- [ ] Write project README (repo has none)
- [~] Slice 3 (Platform Admin, docs/build/slice-3-plan.md, roadmap Tier A+B): PlatformAdmin allowlist + resolveUserRole 3-way (platform-admin > patient > nutritionist); /admin dashboard (metrics + consultas counts-only, operator-blindness) + access-code generator/revoker (retires the manual SQL from adr/0003); role routing in home/panel/proxy; 3 new integration tests (role precedence, operator-blindness, code mint/revoke guard). Pending: owner migrate+generate+gates+test:integration; sign up fresh superadmin email (I seed PlatformAdmin via Neon); smoke /admin; commit; CI green.
- [~] Slice 2 (Progress / weight log, docs/build/slice-2-plan.md): Measurement model (append-only, org-scoped) + WeightRecorded; patient weight check-in on /mi-espacio; dependency-free SVG chart (design.md 12: goal line, no zero baseline, inverted success semantics, a11y table); nutritionist panel latest-weight + delta column; measurement org-scoping added to the CI isolation test; pure progress fns unit-tested. Pending: owner runs prisma migrate dev + generate + tsc/lint/build + test:integration; smoke; commit; CI green.
- [x] Auth role fix: resolveUserRole (Patient row vs nutritionist); home redirects by role, /panel rejects patients, invitePatient guarded, logout added (signOut + LogoutButton). Fixes patient-sees-panel authz bug + no-redirect home + missing logout. tsc/lint green (owner); smoke passed.
- [x] Specialist onboarding gate (adr/0003): creating a consulta requires a single-use access code (SpecialistAccessCode, atomic updateMany redemption). Closes the "anyone can create a consulta" hole. migrate + tsc/lint/build green (owner); 3 codes seeded via Neon; smoke pending.
- [~] NORTE design system - shell slice: Topbar (18.7) + ThemeToggle (light/dark, inline SVG, no new dep) + Button/Card primitives (tokens); wired into /panel (Card metrics) and /mi-espacio (both views).
- [~] Token migration batch 1: Input primitive; auth (sign-in/up), crear-consulta, /panel (table, badges, invite, cancel), home, logout off default palette to NORTE tokens. Build + visual green (owner). Pending batch 2: accept-invitation flow + evaluacion wizard (wizard-step, review, guardrail-banner).
- [x] Token migration batch 2: accept-invitation (page/form/switch-account), evaluacion wizard (options, progress, guardrail info/healthy/aggressive, review), mi-espacio summary. No default palette left in src (grep clean). Build + visual green (owner). Dark mode now complete across the app. Remaining design work: adopt lucide-react for the broader icon/component set (15.x) and remaining component specs.
- [~] NORTE design system (design.md, branded Nutrionyx per ADR-0003). Foundation done: tokens light+dark (globals.css) mapped to Tailwind 4 via @theme inline; base typography 18.1; self-hosted fonts Syne/DM Sans (fontsource) + Geist Mono, no Google CDN (C9); anti-FOUC dark script (key nutrionyx-theme). Build green (owner: install + tsc + lint + next build), fonts confirmed. Pending: theme toggle + app shell; migrate screens off default Tailwind palette to tokens (18.9); component specs (15.x).
- [x] LPEF Prisma Standard R5: tenant-isolation test (src/modules/isolation.integration.test.ts) + scripts; validated by owner against Postgres; now enforced in CI via a postgres service + prisma migrate deploy (ci.yml), so it runs on every push (33 unit + 3 isolation). R5 is machinery, not manual.

## Review

Adoption playbook (LPEF playbooks/adopt-lpef.md) executed for the first time 2026-07-09: all DoD items passed. Friction to feed back to LPEF at next release: none blocking; playbook step 6 (verify refs at pinned tag) required the tag to be pushed first - ordering note worth adding to the playbook's Prerequisites.
