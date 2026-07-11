---
type: adr
title: Adopt Pulse CRM as the UI/pattern source for the specialist portal
status: accepted
created: 2026-07-11
---

# ADR-0005: Adopt Pulse CRM as the UI source

## Context

Ten dashboard/CRM templates under `dashboards/` were evaluated against our stack (Next.js 16 App Router, React 19, Tailwind 4, TypeScript) and the specialist-portal domain.

- Disqualified: **asanah / matdash / spike** (Vite SPAs - framework mismatch with our App Router + server actions), **essence** (Material UI - CSS-in-JS clashes with Tailwind + our NORTE tokens), **NexLink** (static HTML/jQuery), **Core** (React 18, no router), **unity-gaming-code** (not a dashboard), **tixora** (our stack, but an events/ticketing domain and a thin component set).
- Best fit: **Pulse CRM Dashboard** - identical stack (Next 16.1 App Router, React 19.2, Tailwind 4, TS); a CRM whose information architecture maps almost 1:1 to the specialist portal (customers -> patients, overview -> dashboard, calendar -> scheduling, activity -> follow-up, settings -> ajustes, full auth suite); UI-only with mock data (`lib/data`), so no backend/DB/auth to fight our Prisma/Neon Auth; a rich, coherent component set (21 UI primitives, 17 dashboard components, ~18 feature drawers/modals) plus recharts.

The owner holds a **commercial license** for Pulse that permits use and modification.

## Decision

Adopt Pulse CRM as the **UI and pattern source** for the specialist portal. We **adapt** its app shell and components into our repository, **rethemed to NORTE tokens** (Pulse uses a hardcoded Tailwind palette, e.g. `neutral-950`; we replace those with our semantic token utilities), **incrementally, one slice at a time**, on top of our existing domain, Prisma, and Neon Auth.

We do **not** replace our working foundation (NORTE tokens, domain model, auth, the screens that already work) and do **not** migrate wholesale. New dependencies from Pulse are taken only when justified (AR5): recharts when we build real charts; the shell, tables, and dashboard cards need none.

## Consequences

Positive: months of coherent, proven CRM UI (sidebar+header shell, data tables, entity drawers, filters, command palette, metric cards, charts) accelerate the roadmap tiers; the information architecture is validated rather than invented.

Negative, accepted: rethemeing each adopted component to NORTE is real, if mechanical, work; we carry the commercial-license obligation (owner confirmed 2026-07-11); adapted code is reviewed and refitted to our conventions (server components + actions, es-only i18n, our tokens) rather than pasted verbatim. This introduces a sidebar app shell that supersedes the topbar-only shell for the specialist area over the next slices.
