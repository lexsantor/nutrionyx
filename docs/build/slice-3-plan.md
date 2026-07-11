# Build Plan: Platform Admin - role, dashboard, code generator (Slice 3 / Roadmap Tier A+B)

Status: approved 2026-07-11 (owner); built. Verification (migrate + gates + seed admin + smoke) tracked in tasks/todo.md.
Created: 2026-07-11. Inputs: [roadmap](roadmap-platform-roles-billing.md) Tier A+B, [adr/0004](../../adr/0004-vision-led-slice-built.md) (vision-led, operator-blindness), [Vision](../00_Vision_and_Target_Architecture.md) (Platform Admin context, RBAC), [adr/0003](../../adr/0003-specialist-onboarding-access-code.md) (SpecialistAccessCode), [05](../05_Identity_Access_Model.md) (permission matrix), LPEF Prisma/Next.js standards.

## Problem (C1)

The platform owner has no in-app presence: specialist onboarding codes are minted by hand in SQL (adr/0003), and there is no view of specialists, consultas, or platform health. This slice gives the owner a real third role and a minimal operations surface, and retires the manual SQL - the backbone the rest of the roadmap hangs on.

## Domain decision

- Third role **Platform Admin** (superadmin), identified by an explicit allowlist (`PlatformAdmin` table keyed by `authUserId`), checked **first** in role resolution. A platform admin is neither patient nor nutritionist.
- `resolveUserRole` -> platform-admin > patient (Patient row) > nutritionist. Home and gates route accordingly; `/admin` is platform-admin-only.
- **Operator-blindness** (adr/0004, C9/C13): the `/admin` surface reads only business/platform data - organizations (consultas), patient **counts**, access codes, platform metrics - and **never** clinical tables (assessment, measurement). Enforced by a dedicated platform-admin repository that only touches business fields.
- Scope: this slice adds the three top-level roles. Full RBAC (specialist teams with scoped permissions) is a later slice (Vision §2).

## Data model

- `PlatformAdmin`: `id`, `authUserId` (unique), `note?`, `createdAt`. `@@map("platform_admins")`. Seeded out-of-band to bootstrap the owner (as the first access code was).
- `SpecialistAccessCode`: add `createdBy String?` (authUserId of the minting admin) for provenance/audit. Otherwise unchanged.

## Vertical slice, in build order

1. Schema + migration: `PlatformAdmin`, `SpecialistAccessCode.createdBy`. Owner runs `prisma migrate dev`.
2. `src/modules/platform-admin/` (Next.js R1): `isPlatformAdmin(authUserId)`; `listConsultas()` -> org + patient count + created (no clinical); `platformMetrics()` -> counts (consultas, specialists, patients, codes used/pending); `listAccessCodes()`, `createAccessCode(note, createdBy)`, `revokeAccessCode(code)` (only if unused, guarded). Platform-scoped across orgs but business-only.
3. Role resolution: extend `resolveUserRole` to three-way; update the home redirect and add an `/admin` gate (page + `proxy.ts` matcher). A nutritionist or patient hitting `/admin` is redirected to their own area.
4. `/admin` dashboard (Topbar + NORTE tokens): metric cards; specialists/consultas table (name, created, patient count); code generator (mint form + code list with used/pending + revoke). All copy via `messages/es.json`.
5. Retire manual seeding: the code generator replaces the SQL path from adr/0003 (that ADR's mechanism is superseded; codes stay single-use).
6. Tests: operator-blindness (the admin repository selects only business fields/counts - a shape test plus an integration assertion that admin listings expose no clinical data); role precedence (platform-admin first) unit test; code mint/revoke guarded (revoke only unused). Extend the CI isolation test as needed.

## Quality gates (done means all pass)

- Operator-blindness verified by test: admin queries never read clinical columns; counts only.
- Only platform-admins reach `/admin`; non-admins redirected (tested).
- Code generator: mint -> unused; revoke unused -> gone; revoke used -> refused.
- Zero hardcoded UI strings; keyboard-accessible; migration reviewed (additive).
- CI green (unit + integration incl. isolation).

## What this plan does NOT include

Full RBAC / specialist teams, billing, custom domains, branding, marketplace, AI, and revenue metrics (MRR/ARR/churn need billing data - this slice shows operational counts, not revenue).

## Owner actions needed

1. Approve this plan.
2. Choose the superadmin account: sign up a **fresh email** as the platform-owner account (recommended - keeps it separate from any consulta) and tell me its email; I seed it into `PlatformAdmin` via Neon once the table exists. (Designating an existing account also works, but that account then routes to `/admin`, not `/panel`.)
3. Run `prisma migrate dev`; smoke test `/admin`.

## Risks

- Role precedence: a user who is both platform-admin and nutritionist routes to `/admin` by design. One account for both would need an account switcher - deferred.
- Operator-blindness is enforced in code and guarded by tests, not by DB permissions; a future hardening could add DB-level row/column security.
