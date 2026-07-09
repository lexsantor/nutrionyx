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
- [ ] Step 4: assessment wizard (es strings via next-intl)
- [ ] Step 5: capture-time guardrail UI
- [ ] Step 6: completion, events, dashboard unlock
- [ ] Step 7: metrics instrumentation
- [ ] Write project README (repo has none)

## Review

Adoption playbook (LPEF playbooks/adopt-lpef.md) executed for the first time 2026-07-09: all DoD items passed. Friction to feed back to LPEF at next release: none blocking; playbook step 6 (verify refs at pinned tag) required the tag to be pushed first - ordering note worth adding to the playbook's Prerequisites.
