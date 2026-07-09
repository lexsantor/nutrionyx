---
type: adr
title: Assessment collects food preferences; Diet Plan owns them
status: accepted
created: 2026-07-09
---

# ADR-0002: Assessment collects food preferences; Diet Plan owns them

## Context

The reference flow elicits food preferences during onboarding ("Lo amo o lo odio", step 25/27 in [reference-flow-analysis](../docs/research/reference-flow-analysis.md)). Nutrionyx's domain model (PRD_03, 09_Domain_Model) has no food vocabulary at all, and the question of which aggregate owns preferences shapes both the Assessment and Diet Plan contexts. Options: preferences live inside the Assessment aggregate (mirrors the reference flow literally); preferences belong to the Diet Plan context but may be captured during assessment; or defer preferences out of slice 1 entirely.

## Decision

Food preferences belong to the Diet Plan bounded context. The Assessment flow may present preference-capture steps, but it writes them to the Diet Plan context; the Assessment aggregate stays clinical and anthropometric. For slice 1, preference capture is optional scope - if cut, the Assessment ships without it and nothing in the Assessment aggregate changes later.

## Consequences

Positive: the Assessment aggregate stays stable when diet logic evolves; preferences sit next to the food/meal vocabulary that will consume them; slice 1 can cut preference capture without domain rework.

Negative, accepted: capture-time writes cross a context boundary (assessment UI writing Diet Plan data), which needs an explicit contract when preference capture is built.
