# Design report — project

> No blocking issues open.

## LEXIA SCORE: 75.4 / 100 — C (Usable, material gaps)

| | |
|---|---|
| Iteration | 2 |
| Coverage | code-inferred (NOT RENDERED); detector 0.7.3 deep + verification; 3 fresh reviewer agents (ux, visual, motion); contrast measured from tokens; correctness lens (tz, i18n keys); repo-level; landing+patient+console+auth+admin |
| Dimensions scored | 15 of 15 |
| Weighted raw | 75.4 / 100 |
| Delta vs previous | -0.08 |
| Verdict | continue |

Score capped: not visually verified (no render) (already below cap 89). The raw weighted value was 75.4.

## Dimensions

| # | Dimension | Score | Weight | Points | Δ | Evidence |
|---|---|---|---|---|---|---|
| 1 | TASK_CLARITY | 8.2/10 | 9 | 7.4 | +0.2 | 3-click adherence read; 1-min check-in walked; deduction: Hoy-status/weight-input split, raw i18n key on console home |
| 2 | INFORMATION_ARCHITECTURE | 8/10 | 7 | 5.6 | +0.5 | persistent shell, URL-held search/pagination/wizard; deduction: 8-concern patient home without anchors |
| 3 | USABILITY | 7.3/10 | 10 | 7.3 | +0.3 | forms disciplined; deductions: React19 error-reset data-loss risk (unconfirmed at runtime), 1-click appointment cancel,  |
| 4 | ACCESSIBILITY | 7.6/10 | 10 | 7.6 | +0.1 | 0 criticals; measured focus ring 4.6-8.9:1; deductions: conditional live regions x8, skip-link target missing on first-r |
| 5 | CONTENT_INTEGRITY | 8.7/10 | 9 | 7.8 | -0.3 | 0 fabrications; claims verified vs code; deduction: negative-parallelism density x5, byline needs owner confirmation |
| 6 | VISUAL_HIERARCHY | 6.8/10 | 7 | 4.8 | -0.6 | subjective, not visually verified; landing strong, console detail 12 equal headings, dashboard heading glued to cards |
| 7 | TYPOGRAPHY | 7.2/10 | 6 | 4.3 | -0.4 | measures capped, pairing deliberate; deduction: no tabular-nums on the primary adherence ledger, 4-size stat numeral dri |
| 8 | COLOR_AND_CONTRAST | 7/10 | 6 | 4.2 | -0.6 | measured both themes from tokens; light passes exc. 4.39:1 chip; DARK ACCENT COLLAPSE: primary=ink-subtle=focus-ring=acc |
| 9 | SPACING_AND_RHYTHM | 6.5/10 | 5 | 3.3 | -0.9 | token rhythm clean; deductions: bento auto-placement holes in 2/4 content states, 0px-below heading on dashboard |
| 10 | RESPONSIVENESS | 7.8/10 | 7 | 5.5 | +0.8 | dvh sweep, overflow wrappers, stress-safe strings; not rendered at 320px/200% zoom |
| 11 | SYSTEM_COHERENCE | 7/10 | 6 | 4.2 | -0.2 | zero rogue hex; deductions: DESIGN-SYSTEM.md empty (contract unauditable), ledger Row x3 variants, 500ms hover-color str |
| 12 | DISTINCTIVENESS | 6.8/10 | 6 | 4.1 | -0.6 | subjective; landing passes interchangeability, dashboard+auth fail covered-logo test; capped by paid-surface rule |
| 13 | MOTION_QUALITY | 8.3/10 | 4 | 3.3 | -0.3 | single-curve token system incl. bare utilities; body map not motion-dead; deductions: theme-change 3 registers, 2 stray  |
| 14 | PERFORMANCE | 7.8/10 | 6 | 4.7 | -0.1 | motion share 8.5 (CSS-only, compositor-clean exc. grain blend); deduction: 11-await waterfall on the highest-frequency p |
| 15 | PRODUCTION_READINESS | 7.4/10 | 7 | 5.2 | +0.9 | CI green (run 31570855309); per-segment boundaries; deductions: missing panel.metrics.title key shipping, hardcoded auth |
| | **TOTAL (applicable)** | | 105 | **75.4** | | |

## Gates

| Gate | Value | Threshold | Result |
|---|---|---|---|
| total | 7.49 | >= 8.5 | FAIL |
| distinctiveness | 6.8 | >= 7.5 | FAIL |
| criticalA11y | 0 | <= 0 | PASS |
| criticalUsability | 0 | <= 0 | PASS |
| regressions | 0 | <= 0 | PASS |

Scores are judgment anchored to evidence, not measurement. Dimensions
marked n/a are excluded and the total renormalized. A deeper audit
scoring lower than a shallower one is not a regression: compare only
across equal coverage.
