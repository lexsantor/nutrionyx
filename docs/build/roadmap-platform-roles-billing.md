# Roadmap: Platform roles, consulta customization, billing

Status: proposal for owner review. Created 2026-07-11.
Grounds: [05_Identity_Access_Model](../05_Identity_Access_Model.md), [PRD_01](../PRD_01_Executive_Summary.md) (Non-Goals), [PRD_02](../PRD_02_Product_Strategy_Overview.md) §2.5, [PRD_03](../PRD_03_Domain_Definition.md) §3.4-3.8, [04](../04_Product_Operating_Model.md) §4.2, [09](../09_Domain_Model.md) (aggregate-root flag), [adr/0003](../../adr/0003-specialist-onboarding-access-code.md).

## Where we are

- Two **data-derived** roles: Nutritionist (= Organization Owner = "specialist"; "consulta" = Organization) and Patient (05 permission matrix). "Admin" is a named **future** role (05, 06).
- The platform owner exists only **out-of-band**: the "Nutrionyx owner" mints `SpecialistAccessCode` rows by SQL (adr/0003). No superadmin exists in the app.
- Consulta profile = `name` only (`Organization`). A "Settings/Configuration" child is named but empty (09, 04, 07).
- Billing is a **Non-Goal for now, named future** (PRD_01 Non-Goals; PRD_02 §2.5 "enable future subscription plans"; 04 §4.2 "Subscription lifecycle (future)"). Zero payment entities.
- Monetization shape (your note + PRD_02 KPIs "active nutritionists / clinic retention"): **specialists pay Nutrionyx a recurring subscription (B2B SaaS)**. Patients do not pay through the platform.

## Three additions to declare (net-new, no conflicts with the docs)

1. A third role: **Platform Admin** (superadmin), above specialists, for platform operations. Extends the 05 permission matrix with a superadmin column.
2. **Operator-blindness** (new C9/C13 rule): the platform admin manages accounts, access, and billing but **cannot read patient clinical/private data** - only the managing specialist can. The docs only cover cross-tenant isolation today; we declare this as a strengthening of Privacy-by-Design, enforced by the same org-scoped repository discipline (admin queries never touch clinical tables).
3. A **Billing bounded context** (Subscription/Invoice/Payment), org-scoped, greenfield - arrives with a project ADR that declares its aggregate roots **and closes the open 7-vs-4 reconciliation** (PRD_03 §3.5 vs 09).

## Phased plan (vertical slices, owner-approved sequentially - the house cadence)

### Tier A - Platform role backbone (small, foundational; do first)

- ADR-0004: the Platform Admin role + the operator-blindness rule. Superadmin is identified by an **explicit allowlist** (a `PlatformAdmin` table keyed by `authUserId`), checked **first** in role resolution - a superadmin is neither patient nor nutritionist.
- `resolveUserRole` becomes: platform-admin > patient (Patient row) > nutritionist. Superadmin lands on a new `/admin` area; patients and nutritionists are unaffected.
- Why first: it is the backbone everything else hangs on; low risk; tiny schema (an allowlist).

### Tier B - Superadmin dashboard v1 + code generator

- `/admin`: list specialists + their consultas (counts only - patients, status, created; **never clinical data**), and a **code generator** UI to mint/revoke `SpecialistAccessCode` (retires the manual SQL seeding from adr/0003).
- Platform metrics: consultas, specialists, codes used/pending.
- Why: directly answers "ver especialistas y consultas" and "generador de códigos"; high value; retires manual ops; no billing yet.

### Tier C - Consulta customization (specialist profile)

- `Organization` profile fields: legal name, CIF/tax id, locality/address, schedule/hours, logo, slug/brand - filling the "Settings/Configuration" placeholder (09/04/07). A Settings screen for the specialist; the logo feeds the NORTE brand slot.
- Why: your "personalizar su consulta"; independent of billing; improves the product regardless of monetization.

### Tier D - Patient profile depth (as needed)

- Expand the patient lifecycle states and profile fields per 04 §4.3 (beyond INVITED/ACTIVE) as later slices need them. Small, incremental. Clinical data stays on Assessment (deliberate), not on Patient.

### Tier E - Billing / recurring payments (the big one; when you monetize)

- New **Billing bounded context**: `Subscription`, `Invoice`, `Payment` (org-scoped). **ADR-0005** declares these aggregate roots **and reconciles the 7-vs-4 discrepancy** in the same change (09 open flag).
- **Stripe Billing** (AR5: building billing and PCI is not something to own; Stripe is the boring, correct buy). Specialists subscribe to Nutrionyx monthly; webhooks keep subscription status; **no card data in our database** - PCI stays with Stripe (C9).
- Gate consulta access on an **active subscription**, superseding/augmenting the beta access-code (adr/0003 explicitly anticipated this).
- Superadmin sees subscription/payment status per specialist ("los pagos que realizan mes a mes").
- Owner decisions before this tier: plans/pricing (tiers, price, trial), currency, tax (Stripe Tax?), and whether the access-code beta gate stays as an extra invite layer.

## Key decisions for you now

1. **Monetization model**: confirm specialists pay Nutrionyx a recurring subscription (B2B SaaS), not patients paying specialists.
2. **Payment provider** at Tier E: Stripe Billing (recommended) vs other.
3. **Starting point**: Tier A+B first (role backbone + superadmin dashboard + code generator) is the recommendation - it de-risks the model and retires manual ops; billing (Tier E) when you are ready to charge.

## What this is NOT (yet)

Patient-facing payments / marketplace (Stripe Connect complexity), messaging, telemedicine, AI - all remain future per PRD_01 Non-Goals.
