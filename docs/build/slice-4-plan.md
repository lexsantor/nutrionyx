# Build Plan: Consulta profile / Settings (Slice 4 / Roadmap Tier C)

Status: approved 2026-07-11 (owner; logo by URL); built. Verification tracked in tasks/todo.md.
Created: 2026-07-11. Inputs: [roadmap](roadmap-platform-roles-billing.md) Tier C, [Vision](../00_Vision_and_Target_Architecture.md) (Settings placeholder, entitlements), [09](../09_Domain_Model.md)/[04](../04_Product_Operating_Model.md)/[07](../07_Information_Architecture.md) (Organization "Settings/Configuration" child), LPEF Next.js/Prisma standards.

## Problem (C1)

A consulta today is just a `name`. A specialist cannot set the legal/fiscal and contact details that make the consulta theirs and that billing will later need (invoices require a tax id and address). This slice fills the specified-but-empty "Settings/Configuration" of the Organization.

## Domain decision

- Extend the **Organization** aggregate with profile fields (the "Settings" child from 09/04/07). Org-scoped: a specialist edits only their own consulta (Prisma R2, org taken from the session, never client input).
- Scope: text/profile fields + a logo **by URL** for now. **Not** the booking/availability system (that is the Scheduling context, future) - "hours" here is display-only free text. **Not** file upload / blob storage (deferred; logo-by-URL now, real upload is a follow-up with a storage decision).
- Fiscal fields (`taxId`, address) are captured now because Billing (Tier E) invoices will need them.

## Data model

`Organization` gains (all nullable): `legalName`, `taxId`, `addressLine`, `locality`, `postalCode`, `country` (default "ES"), `hours`, `logoUrl`, `slug` (`@unique`, kebab, defaulted from name, editable). No `updatedAt` churn concerns - a plain profile row.

## Vertical slice, in build order

1. Schema + migration (additive, nullable). Owner runs `prisma migrate dev`.
2. `src/modules/organization/` profile functions: `getOrgProfile(organizationId)`, `updateOrgProfile(organizationId, fields)` - org-scoped; slug uniqueness guarded (a taken slug is rejected, not thrown).
3. `/panel/ajustes`: a Settings screen (nutritionist-gated) with the profile form (NORTE `Input`/`Button`), a server action with typed `FormState` and logged failure paths (Next.js R2/R3), all copy via `messages/es.json`. Linked from the panel.
4. Small brand touch: show the consulta name (and logo if set) in the specialist's console; full branding wiring is a follow-up.
5. Tests: org-scoping (a specialist cannot update another org's profile - extend the CI isolation test); slug uniqueness/validation; profile update round-trip.

## Quality gates (done means all pass)

- Org-scoping test (profile update guarded by organizationId); slug uniqueness enforced; zero hardcoded strings; keyboard-accessible; additive migration.
- CI green (unit + integration incl. isolation).

## What this plan does NOT include

File upload / blob storage (logo-by-URL now), scheduling/availability/bookings, custom domain, a public consulta page, and the marketplace - all future contexts.

## Owner actions needed

1. Approve this plan.
2. Decide logo: **URL now** (recommended) vs real upload (needs a storage decision - Vercel Blob / S3 - as a follow-up).
3. Run `prisma migrate dev`; smoke the Settings screen.

## Risks

- Slug collisions: validation + a uniqueness guard are required.
- Scope creep toward the Scheduling context - kept out; "hours" is display text only for this slice.
