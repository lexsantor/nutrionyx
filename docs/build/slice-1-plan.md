# Build Plan: Assessment Slice (Slice 1)

Status: pending owner review - no code until approved.
Created: 2026-07-09. Inputs: [discovery](../discovery/assessment-slice.md) (closed), [Assessment aggregate](../09_Domain_Model.md), [ADR-0001](../../adr/0001-spanish-ui-i18n-from-day-one.md), [ADR-0002](../../adr/0002-food-preferences-ownership.md), [stack-2026](https://github.com/lexsantor/lpef/blob/v0.2.0/standards/stack-2026/profile.md).

## Scaffold

Next.js (App Router) + TypeScript strict + Tailwind + shadcn/ui + Prisma + PostgreSQL + Clerk + Vercel, latest stable at creation, pinned by lockfile (stack-2026 R2). Package manager: pnpm.

One dependency beyond the profile: `next-intl` for the i18n layer. Justification (LPEF AR5): ADR-0001 mandates i18n from the first component; Next.js App Router has no built-in message/translation system; hand-rolling one is owning a solved problem. Cost accepted: one well-maintained dependency at the presentation boundary only.

## Architecture

Modules by domain, not by technical layer (LPEF AR1):

```text
src/
  modules/
    organization/     Clerk org mapping, membership, settings
    patient/          patient profile, invitation lifecycle
    assessment/       aggregate: model, state machine, computed values, events
  app/                routes only - thin, calls modules
    (nutritionist)/   org-scoped console: patients, invitations
    (patient)/        activation, assessment wizard, dashboard
  lib/                prisma client, i18n setup, shared utilities
messages/es.json      all UI strings (ADR-0001; domain stays English)
prisma/schema.prisma
```

Multi-tenancy: Clerk Organizations as the identity spine. One Clerk org = one Nutrionyx Organization. Every Prisma model carries `organizationId`; every query is org-scoped through a single repository layer - no raw client access from routes (guards the PRD invariant: one organization per patient).

Assessment data model (from the aggregate spec): `Assessment` rows with `status` (IN_PROGRESS | COMPLETED), `version`, `predecessorId` for repeats, answer fields per the core clinical intake sections, computed `bmi` and `targetDeltaRatio` persisted at completion. `AssessmentCompleted` is a domain event recorded in an `events` table (append-only), and the dashboard unlock derives from the first COMPLETED row - no boolean flag to drift.

## Vertical slice, in build order

1. Scaffold + CI (lint, typecheck, test, build) - the gates exist before the first feature (LPEF C7).
2. Identity spine: Clerk auth, organization bootstrap, nutritionist role.
3. Patient invitation -> activation (Clerk invitation flow, patient record created on acceptance).
4. Assessment wizard: one question per screen, progress indicator, resume on return (InProgress state), es-only strings via next-intl.
5. Capture-time guardrail: tiered feedback on target weight ratio (blue/green/orange), BMI computed live.
6. Completion: freeze, persist computed values, emit AssessmentCompleted, unlock both dashboards (patient summary view, nutritionist patient view).
7. Instrumentation for the two metrics: completion rate, median completion time (they are the slice's success criteria; shipping without measurement violates BU2).

## Quality gates (done means all pass)

- Tests with every behavior: state machine transitions, versioning-on-repeat, org scoping (a patient from org A must be unreachable from org B - tested), BMI/ratio computation (LPEF EN2).
- Accessibility: wizard fully keyboard-operable, labels and announcements correct (EN3, DS4).
- Performance budget: wizard step transition under 200 ms perceived, no layout shift (EN3).
- Zero hardcoded UI strings - CI greps for literal Spanish outside `messages/` (ADR-0001, mechanical per C7).
- Prisma migrations reviewed; no destructive migration without a plan.

## What this plan does NOT include

Diet plans, medication, exercise, messaging, food preferences (ADR-0002 optional scope - cut from slice 1), payments, and the marketing-funnel patterns rejected in the reference flow analysis (C13).

## Owner actions needed during the build

1. Clerk account: create the application, provide publishable + secret keys as environment variables (I never handle them in chat or code - you place them in `.env.local` and in Vercel).
2. PostgreSQL: a hosted dev database (Neon or Vercel Postgres) or approve local-only development first. Connection string handled the same way as Clerk keys.
3. Vercel: connect the GitHub repo when we deploy.

## Risks

- Clerk Organizations semantics may not map 1:1 to the Organization aggregate (invitation of patients as org members vs external users). If the mapping fights us, that becomes the project's first deviation candidate against stack-2026 - which is exactly the feedback M2 exists to produce.
- The 15-minute completion budget constrains the wizard's field count; the core clinical intake list must survive a timing pass in step 4.
