---
type: adr
title: Specialist onboarding is gated by a single-use access code
status: accepted
created: 2026-07-10
---

# ADR-0003: Specialist onboarding access code

## Context

The role model distinguishes a nutritionist (organization owner) from a patient by the domain `Patient` row: a user with a `Patient` row (created when they accept an invitation) is a patient; anyone else is treated as a nutritionist. Patients only ever arrive by a nutritionist's invitation and never self-serve.

This left a hole: the generic sign-up form creates an account with no `Patient` row, so any anonymous visitor who signs up becomes a "nutritionist", and `/panel/nueva-organizacion` created a consulta with no validation whatsoever. For a clinical product that holds patient data, uncontrolled creation of consultas by anyone is unacceptable - creation must be authorised by Nutrionyx (the platform owner).

## Decision

Creating a consulta (organization) requires redeeming a single-use access code issued by the Nutrionyx owner.

- Codes live in `SpecialistAccessCode` (`code` unique, `usedAt`, `usedBy`, `note`).
- Redemption is atomic: an `updateMany` with the guard `{ code, usedAt: null }` asserting `count === 1`, run before any organization is created. A used or unknown code is a no-op, not a race (same guard pattern as the assessment immutability rule).
- If organization creation fails after a code is claimed, the code is released, so a transient error does not burn a valid code.
- Patients are additionally blocked from the create action by role (defense in depth).
- Codes are issued out-of-band by the owner (seeded directly for now); each is valid once.

This is a closed-beta gate. A heavier onboarding flow - request/approval, billing, or an admin UI to mint codes - can supersede it when the product needs it.

## Consequences

Positive: the owner controls exactly who can run a consulta; codes are single-use, revocable (delete an unused row), and auditable (`usedBy`/`usedAt` record who redeemed which code and when); there is no unlimited self-signup of specialists; the machinery is one table and two guarded queries (C8).

Negative, accepted: codes must be minted and distributed out-of-band until an admin UI exists; a legitimate specialist without a code is blocked until one is issued; the gate is intentionally restrictive for the beta and will be revisited when onboarding scales.
