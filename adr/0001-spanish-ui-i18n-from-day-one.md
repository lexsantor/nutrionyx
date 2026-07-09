---
type: adr
title: Spanish UI for v1, i18n architecture from day one
status: accepted
created: 2026-07-09
---

# ADR-0001: Spanish UI for v1, i18n architecture from day one

## Context

Project documentation is in English, but all market evidence points Spanish: the reference flow studied ([reference-flow-analysis](../docs/research/reference-flow-analysis.md)) is a Spanish-language product, and the first target market is Spanish-speaking. LPEF's handbook treats internationalization as a day-one architectural decision, not a retrofit. Options: Spanish-only now and retrofit i18n later; English-first to match the docs; or Spanish UI on i18n scaffolding.

## Decision

The v1 user interface ships in Spanish. All user-facing strings live in an i18n layer from the first component - no hardcoded copy. The domain language, code identifiers, and project documentation remain in English (the ubiquitous language of PRD_03 is English; translation happens at the presentation boundary only).

## Consequences

Positive: the first market gets a native product; adding languages later is content work, not engineering; domain language stays stable and unambiguous in code.

Negative, accepted: every UI string costs an extra indirection from day one; the English-Spanish boundary at presentation requires a glossary mapping domain terms to user-facing Spanish terms, which does not exist yet and must be produced with the first screens.
