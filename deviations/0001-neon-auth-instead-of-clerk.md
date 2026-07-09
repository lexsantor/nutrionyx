---
type: deviation
title: Neon Auth replaces Clerk as the authentication provider
status: active
created: 2026-07-09
expires: 2027-01-09
---

# Deviation: Neon Auth replaces Clerk as the authentication provider

## Rule Overridden

[Stack Profile 2026, R1](https://github.com/lexsantor/lpef/blob/v0.2.0/standards/stack-2026/profile.md) - "Auth: Clerk". Pinned LPEF version: v0.2.0.

## Justification

Specific to this project's constraints, verified 2026-07-09:

1. Platform consolidation: the project already uses Neon for PostgreSQL. Neon Auth (built on Better Auth) provides auth on the same platform, with users synced into the same database - eliminating the Clerk-to-database webhook sync layer entirely (one less integration to build, test, and keep consistent).
2. Domain fit: Clerk Organizations would model patients as organization members, which is semantically wrong (patients are not staff) and bills as MAU/members.
3. Slice-1 needs (multi-tenant orgs, email invitations, roles) are covered by Neon Auth's Organization plugin.

Known risk, accepted: the Organization plugin is Beta (JWT claims still in development). Mitigation: session checks happen server-side against the database, not via token claims. Pre-launch project; the risk window is owned.

## Expiry

2027-01-09, or earlier if the Organization plugin's Beta status causes a blocking defect. At expiry: either Neon Auth has proven itself (propose amending stack-2026's auth entry at the next LPEF release) or the project returns to the profile's Clerk default.
