---
type: adr
title: Specialist sub-role (specialtyType) drives configuration, not access; GDPR/DPA consent at activation
status: accepted
created: 2026-07-11
---

# ADR-0006: Specialist sub-role and activation consent

## Context

An external, implementation-oriented PRD was produced for the weight-loss SaaS.
Its genuinely new idea is splitting the specialist into two kinds -
**Dietista-nutricionista** and **Nutricionista deportivo** - with that choice
driving the dashboard, terminology and active templates. It also proposes a
multi-field professional questionnaire and a guided product tour at onboarding.

We metabolize the PRD **vision-led, not as a build spec** ([adr/0004](0004-vision-led-slice-built.md);
LPEF C2/C6/C8). Most of the PRD is either already built (invite-by-code
[adr/0003](0003-specialist-onboarding-access-code.md), patient invite/accept,
weight tracking, the specialist console) or already named in the
[Vision](../docs/00_Vision_and_Target_Architecture.md) and the
[roadmap](../docs/build/roadmap-platform-roles-billing.md). The one decision that
is expensive to reverse - and therefore worth locking now - is **whether and how
the specialist carries a sub-role**. This ADR decides that shape and the
activation gate around it; it does not schedule the build (see
[slice-6-plan](../docs/build/slice-6-plan.md)).

## Decision

1. **Sub-role as configuration, not access.** Add `specialtyType` to
   `Organization` (the consulta), enum `DIETITIAN | SPORTS_NUTRITIONIST`. It
   drives presentation (dashboard widgets, terminology, default templates), never
   permissions. Our role model - platform-admin > patient > nutritionist
   ([adr/0004](0004-vision-led-slice-built.md), [05](../docs/05_Identity_Access_Model.md)) -
   is about **access**; the sub-role is about **configuration**. Modelling it as a
   new RBAC role would inflate the permission matrix and put operator-blindness at
   risk for no gain. As an `Organization` attribute it is business metadata:
   super-admin-visible (non-clinical, preserves C9/C13 operator-blindness) and
   specialist-editable (self-service, consistent with the editable consulta name).

2. **Set at activation, editable later.** The sub-role is chosen in the
   activation step, with a one-line preview of what each choice activates, and is
   editable afterwards in Ajustes. We **decline** the PRD's professional
   questionnaire (country, languages, experience, focus areas, preferred
   templates) and its forced product tour: none of that data drives behaviour in
   v1, and each step is friction before value (the PRD's own KPI is onboard
   < 5 min). Those fields are captured later, when a consumer exists (public
   consulta page, plan builder), through progressive disclosure in Ajustes and
   contextual empty states - not a gate.

3. **GDPR/DPA consent is the one required activation gate.** Before a specialist
   can invite any patient, they must accept the data-processing terms. A
   specialist handling third parties' Art. 9 health data is a controller/
   processor; the EU baseline requires recorded acceptance. Store it as an
   **append-only consent record** (terms version + timestamp), aligning with the
   Vision's "consent management" and "append-only audit log" (Vision §4). This is
   non-negotiable and is the piece the PRD omitted.

4. **Divergence by data, not forked code.** Role-driven configuration is a map
   keyed by `specialtyType` (widget order/visibility, terminology keys, default
   templates), JSON-shaped, so the two experiences differ by data, not by branched
   components. **v1 locks the shape only** - the flag, the consent gate, and a thin
   config scaffold with minimal UI divergence. Full dashboard divergence and
   per-role templates are later slices.

## Consequences

Positive: the one expensive-to-reverse decision (role-model shape, schema, the
RBAC boundary) is locked now, cheaply, without big-design-up-front; RBAC stays
clean; the consent gate closes a real EU gap the PRD ignored; config-by-data
keeps a single codebase.

Negative, accepted: a new enum + migration on `Organization`; activation gains a
required consent step (small friction, legally necessary); the config map starts
thin and grows; a specialist who genuinely practices both must pick one
`specialtyType` in v1 (multi-specialty deferred, matching the PRD's "one role per
account in v1").

## Alternatives rejected

- **New RBAC role per specialty** - over-engineering; permissions do not differ
  between the two.
- **Separate `SpecialistProfile` entity** - premature; a field on `Organization`
  suffices until rich profile data exists, at which point it is extracted.
- **The PRD's questionnaire + guided tour** - unconsumed data and friction;
  deferred to progressive disclosure and empty states.

## Decisions (owner sign-off, 2026-07-11)

- **Consent copy**: v1 ships a **versioned placeholder** DPA, clearly marked; the
  real legal text lands before go-live. The mechanism (append-only, versioned,
  activation gate) is built now.
- **Sub-role editability**: `specialtyType` is **freely editable in Ajustes**,
  including after the first patient - it only reconfigures UI, touches no clinical
  data.
- **Existing consultas (backfill)**: **soft prompt in Ajustes/activation**, not
  forced mid-session; already-active consultas are not blocked to re-consent
  retroactively. `specialtyType` stays nullable until chosen.
