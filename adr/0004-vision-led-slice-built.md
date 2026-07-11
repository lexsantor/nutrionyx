---
type: adr
title: Build the enterprise vision slice-by-slice, not big-design-up-front; declare operator-blindness
status: accepted
created: 2026-07-11
---

# ADR-0004: Vision-led, slice-built - and operator-blindness

## Context

An enterprise-scale product vision was defined for Nutrionyx (Healthie / Practice Better class): platform superadmin, RBAC with specialist teams, clinical treatment (nutrition + training), scheduling, messaging, documents, marketplace, AI, and recurring billing. The accompanying brief asked to "design the definitive product, not an MVP" and to produce a full PRD/FSD/wireframes/backlog up front.

Nutrionyx is governed by LPEF, which forbids exactly that method: C2 (understand before build, build to confirm; thin reversible steps; anti-pattern: "a six-month specification effort with no built slice validating any of it"), C6 (evidence over confidence), C8 (simplicity), C1 (product before code). A 400-feature specification designed now, unbuilt, would be unverified debt.

But the opposite failure is real too: some decisions are expensive to reverse - the role/RBAC model, multi-tenancy, the compliance posture for health data, and the monetization/entitlements shape. LPEF requires those to get scrutiny proportional to their cost of reversal (C2) and to be treated as day-one architectural inputs (C9, C10; PRD_03 §3.8 "no architectural decision may prevent future capabilities").

## Decision

1. Adopt the enterprise scope as **vision / target architecture**, recorded in [docs/00_Vision_and_Target_Architecture.md](../docs/00_Vision_and_Target_Architecture.md) - a north star, not a build order.
2. Build **vision-led but slice-by-slice**: every context and feature ships as a thin, owner-approved, evidence-gated vertical slice per LPEF, traced to a problem (C1) and built behind an entitlement flag. No big-design-up-front; no unbuilt mega-PRD/FSD/wireframes/backlog.
3. **Lock now** (reference docs / ADRs), because expensive to reverse: the bounded-context map, the RBAC role model (Super Admin + Specialist-and-team + Patient), the GDPR/health-data compliance posture, and the plans/entitlements shape.
4. **Operator-blindness (new rule, C9/C13):** the platform Super Admin manages all business and platform data (accounts, access, billing, metrics, config) but **must not access patient clinical or private data**; only the managing specialist can. Enforced by the same org-scoped repository discipline that guards tenant isolation - platform queries never touch clinical tables. This strengthens the existing "Privacy by Design" and "organizations are completely isolated" rules (PRD_01, PRD_03 §3.6), which today cover only cross-tenant access.

## Consequences

Positive: the ambition is preserved without betting the product on an unbuilt specification (C2, C6); nothing in the vision is precluded (C9, C10); compliance for special-category health data is a day-one input rather than a retrofit; and features are gated by entitlements from the first slice, so plans compose cleanly.

Negative, accepted: a bounded set of architecture (RBAC, entitlements, compliance posture) is designed ahead of the slice that exercises it - a deliberate, cost-of-reversal-justified exception to "build to confirm" (C2), kept as small as possible. The vision document will drift from reality and must be revised as slices land; it is a north star, not a contract. The AI clinical features and the marketplace carry regulatory weight (possible medical-device software, health-advertising rules) and each requires a dedicated safety/compliance review before it is scoped - flagged, not resolved here.

Feeds LPEF (C11): the enterprise scope is expected to yield extractable framework assets - an entitlements/feature-flag standard, a multi-tenant RBAC standard, and an EU health-data compliance playbook.

Supersedes nothing. The near-term build sequence is in [docs/build/roadmap-platform-roles-billing.md](../docs/build/roadmap-platform-roles-billing.md); the first slice is Tier A+B (Platform Admin role + superadmin dashboard + access-code generator).
