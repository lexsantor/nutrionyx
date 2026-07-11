# Nutrionyx - Vision & Target Architecture

Purpose: the north star, not a build spec. It exists so every slice slots into a named place and nothing expensive-to-reverse gets precluded (LPEF C2, C9, C10; PRD_03 §3.8 "no architectural decision may prevent future capabilities"). Reference class: Healthie, Practice Better, Nutrium, SimplePractice. **Built vision-led, slice-by-slice** ([adr/0004](../adr/0004-vision-led-slice-built.md)) - this document is the destination, not the order of work.

## 1. Product vision

An enterprise multi-tenant clinical SaaS for nutrition & coaching professionals and their patients: monetized by specialist subscription, covering clinical treatment (nutrition + training), progress monitoring, scheduling, messaging, documents, a discovery marketplace, and AI assistance - with EU-grade privacy and security as a floor.

## 2. Roles & access (RBAC, not three fixed roles)

- **Super Admin (Platform Owner)** - platform operations: SaaS metrics (MRR/ARR/LTV/CAC/churn/NPS...), specialist lifecycle (activate/suspend/transfer/limits/branding/entitlements), billing, global config, marketplace, AI ops. Sees **all business/platform data**. **Operator-blindness (hard rule, C9/C13): never patient clinical/private data** - only the managing specialist can.
- **Specialist (Organization Owner) + Team** - full control of **their own consulta only**, never another professional's. Specialists invite staff with **scoped roles/permissions** → this is RBAC (roles + permissions + members), not a single owner. A specialist also carries a **sub-role** (`specialtyType`: Dietista-nutricionista | Nutricionista deportivo, [adr/0006](../adr/0006-specialist-subrole-and-activation-consent.md)) - this is **configuration** (dashboard, terminology, templates), **not access**, so it lives on the Organization and never touches the permission matrix or operator-blindness.
- **Patient** - only **their own** information, documents, appointments, payments and messages, and only with the professional they belong to.

Identity principles inherited from [05](05_Identity_Access_Model.md): one identity ↔ one Organization, authorization server-side only, **deny by default**. Every resource is org-scoped; cross-tenant access is never allowed (built and CI-enforced).

## 3. Bounded-context map (target)

Each context is org-scoped and ships as evidence-gated slices. Status: [built] / [next] / [future].

- **Identity & Access** - auth, organizations, invitation [built]; RBAC + team members, Platform Admin role [next]; specialist sub-role (`specialtyType`) + activation DPA/consent gate [next, adr/0006].
- **Patient Management** - patient, assessment, progress/measurement [built]; richer profile + lifecycle [future].
- **Clinical Treatment - Nutrition** - diet plans, recipes, meals, macros/micros, exchanges, shopping list, supplementation, restrictions [future].
- **Clinical Treatment - Training** - routines, exercises, videos, sets/reps/load/rest, progression [future].
- **Monitoring** - weight [built]; body measurements, photos, medication/exercise adherence, comparisons [future].
- **Scheduling & Calendar** - agenda, availability, bookings, waitlist, reminders, video (Zoom/Meet), external calendars (Google/Apple/Outlook) [future].
- **Messaging & Communication** - chat, files/audio/video, templates, notifications (email/SMS/WhatsApp/push) [future].
- **Documents** - PDFs, reports, consents, e-signature [future].
- **Billing & Subscriptions** - Stripe, plans/entitlements, invoices, VAT/EU, dunning [Tier E].
- **Platform Admin** - superadmin dashboard, specialist lifecycle, access-code generator [next].
- **Marketplace** - discovery, search/filters, reviews, immediate booking [future, high-compliance].
- **AI** - diet/training generators, analytics analysis, risk detection, report writing [future, high-compliance].
- **Reporting & Analytics** - platform metrics (owner), clinical reports (specialist) [partial/future].

## 4. Compliance & security posture (day-one inputs, C9)

- **Health data is GDPR Art. 9 special category**; the EU baseline is a floor, not a target.
- Multi-tenant isolation [built, CI-enforced]; operator-blindness to patient clinical data [new, adr/0004].
- EU data residency; encryption in transit and at rest; **append-only audit log**; RBAC deny-by-default; Records of Processing (RoPA); DPAs with sub-processors (Stripe, Neon, email/SMS providers); consent management; **export & erasure as tested product features** (privacy PV5).
- **AI on health data** and the **marketplace** (reviews of health professionals) carry weight beyond GDPR (possible regulated medical-device software; health-advertising rules). Each needs a dedicated safety/compliance review **before** it is scoped.

## 5. Monetization & entitlements

- Model (confirmed): **specialists subscribe to Nutrionyx** (B2B SaaS), **Stripe Billing**, no card data in our database.
- Plans **Free / Starter / Pro / Business / Enterprise**, each expressed as an **entitlements set** - limits + feature flags: patient cap, storage, AI quota, team seats, agenda, automations, branding/custom domain, channels (email/SMS/WhatsApp).
- An **entitlements/feature-flag layer is built from the start**: every feature is gated by an entitlement, so plans compose cleanly and Enterprise can be per-tenant custom.
- The **Billing bounded context** (`Subscription`/`Invoice`/`Payment`) arrives with an ADR that also **closes the open 7-vs-4 aggregate-root reconciliation** ([09](09_Domain_Model.md), [PRD_03](PRD_03_Domain_Definition.md) §3.5).

## 6. How we build (the discipline)

Vision-led, **slice-built**: each context/feature is a thin, owner-approved, evidence-gated vertical slice (LPEF C2/C6), traced to a problem (C1), built behind an entitlement flag. No big-design-up-front; no unbuilt mega-PRD/FSD/wireframes. Near-term sequence lives in [roadmap-platform-roles-billing](build/roadmap-platform-roles-billing.md); this document is the destination it walks toward. It will drift from reality and gets revised as slices land - a north star, not a contract.

## 7. What this project gives back to LPEF (C11)

The enterprise scope stress-tests the framework and is expected to yield extractable standards/playbooks: an **entitlements / feature-flag standard**, a **multi-tenant RBAC standard**, and an **EU health-data compliance playbook** - candidates for LPEF M3/M5.
