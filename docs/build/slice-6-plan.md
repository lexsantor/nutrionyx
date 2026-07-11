# Build Plan: Specialist sub-role (specialtyType) + activation consent (Slice 6)

Status: approved (owner R9 sign-off 2026-07-11; [adr/0006](../../adr/0006-specialist-subrole-and-activation-consent.md) accepted). Building in the order below.
Created: 2026-07-11. Inputs: [adr/0006](../../adr/0006-specialist-subrole-and-activation-consent.md), [Vision](../00_Vision_and_Target_Architecture.md) §2/§4, [roadmap](roadmap-platform-roles-billing.md), [adr/0003](../../adr/0003-specialist-onboarding-access-code.md) (activation via access code), [adr/0004](../../adr/0004-vision-led-slice-built.md) (operator-blindness).

## Problem (C1)

A specialist is one undifferentiated "nutritionist" today. The product needs to
know whether they are a **Dietista-nutricionista** or a **Nutricionista
deportivo** to shape their environment (adr/0006), and - independently - the
platform must record **GDPR/DPA consent** before a specialist processes any
patient's Art. 9 health data. Both are missing. This slice locks the **shape**
(adr/0006): the flag, the consent gate, and a thin config scaffold - not the full
role divergence.

## Scope

- **Sub-role flag**: `Organization.specialtyType` (`DIETITIAN | SPORTS_NUTRITIONIST`),
  configuration only, never RBAC (adr/0006).
- **Activation consent**: an append-only consent record captured before a
  specialist can invite patients.
- **Config by data**: a `specialtyConfig(specialtyType)` map (terminology keys,
  widget order, default templates) - thin in v1.
- **Where it slots**: the existing consulta-creation flow (`/panel/nueva-organizacion`,
  already access-code-gated, adr/0003) gains sub-role selection + consent; Ajustes
  gains sub-role editing.

## Domain / data (Prisma R2, org-scoped)

- `enum SpecialtyType { DIETITIAN, SPORTS_NUTRITIONIST }`; `Organization.specialtyType SpecialtyType?`
  (nullable so existing consultas are not broken; see Risks/backfill).
- `model ConsentRecord { id, organizationId, kind (DPA), termsVersion, acceptedAt, acceptedByAuthUserId }`
  - **append-only** (create-only, never updated/deleted), org-scoped, aligns with
  Vision §4 "append-only audit log / consent management".
- Repositories: `setSpecialtyType` / read on the organization repo;
  `recordConsent` / `hasAcceptedConsent(organizationId, kind, version)` on a new
  consent repo. All queries filtered by `organizationId` from the session.
- `specialtyConfig.ts`: a **pure**, unit-tested module mapping `specialtyType` to
  `{ terminology, widgets, defaultTemplates }`. v1 populates terminology + widget
  order only.

## Build order (incremental, each buildable)

1. Schema: `SpecialtyType` enum + `Organization.specialtyType` + `ConsentRecord` + migration.
2. Domain: organization repo (set/read specialtyType), consent repo (record/has),
   `specialtyConfig` + tests.
3. Activation: `/panel/nueva-organizacion` gains sub-role tiles (one-line preview
   per role) + a DPA consent checkbox; `createOrganization` **requires both**
   (guarded: no accepted consent → reject, no org created) and writes the consent
   record atomically with org creation. i18n (es).
4. Ajustes: sub-role is editable (self-service, consistent with the editable name).
5. Config scaffold: panel/console read `specialtyType` and apply terminology +
   a role-tagged empty state. Minimal divergence only.
6. Extend the CI isolation test: `specialtyType` and consent are org-scoped
   (org A cannot read/set org B's; consent for A never counts for B).

## Quality gates

- `specialtyType` and consent are org-scoped (isolation test extended).
- Consent gate enforced: a consulta cannot be created without an accepted,
  versioned DPA consent record.
- Operator-blindness intact: `specialtyType` and consent are business metadata
  (super-admin-visible), never clinical.
- Zero hardcoded strings; keyboard-accessible; `tsc` + `lint` + `build` +
  `test:integration` green.

## What this plan does NOT include

Full per-role dashboard divergence, per-role plan/meal/training templates, the
PRD's professional questionnaire, a guided product tour, and any patient-facing
change. All deferred (adr/0006).

## Owner actions

1. **R9 sign-off on [adr/0006](../../adr/0006-specialist-subrole-and-activation-consent.md)** -
   in particular the two open decisions: DPA consent copy/version (and whether
   counsel reviews it before go-live) and whether `specialtyType` stays editable
   after the first patient.
2. Approve this plan.
3. Run gates + `test:integration`; smoke: activation (pick sub-role + accept
   consent), Ajustes edit, panel terminology by role.

## Risks

- **Consent copy is legal text.** v1 ships a **versioned placeholder** clearly
  marked as such (owner sign-off); the real DPA text (owner/counsel) lands before
  go-live. The mechanism (versioned append-only record + gate) is what this slice
  builds.
- **Backfill (decided).** Existing consultas keep `specialtyType = null` and no
  consent record; we do **not** force re-selection/re-consent mid-session - a
  **soft prompt in Ajustes/activation** surfaces it. `specialtyType` is freely
  editable, including after the first patient.
- Big-ish slice; built in the 6 steps above so each is verifiable; if a step
  balloons it splits into its own commit.
