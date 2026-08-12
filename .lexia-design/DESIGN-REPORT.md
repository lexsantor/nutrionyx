# Design report — project

> No blocking issues open.

## LEXIA SCORE: 77.1 / 100 — C (Usable, material gaps)

| | |
|---|---|
| Iteration | 3 |
| Coverage | RENDERED (Playwright vs production: landing/auth/legal/404 at 375-768-1440 x light-dark, real scroll, 84 captures) for public surfaces; mi-espacio + panel + admin remain code-only (no authenticated session). Detector 0.7.3 deep + verification; 3 reviewer agents anchored to their iteration-2 scores; contrast measured from tokens. |
| Dimensions scored | 15 of 15 |
| Weighted raw | 77.1 / 100 |
| Delta vs previous | +0.18 |
| Verdict | continue |

## Dimensions

| # | Dimension | Score | Weight | Points | Δ | Evidence |
|---|---|---|---|---|---|---|
| 1 | TASK_CLARITY | 8/10 | 9 | 7.2 | -0.2 | specialist adherence read in 3 clicks; patient check-in 2 forms 0 navigations; -0.2 vs iter2: render exposed no mobile s |
| 2 | INFORMATION_ARCHITECTURE | 8/10 | 7 | 5.6 | 0 | route group + persistent shell + URL state; landing still has no skip link or main id across 12 sections |
| 3 | USABILITY | 7.8/10 | 10 | 7.8 | +0.5 | +0.5: destructive two-step x2, target floor, future dates, React19 data-loss class closed at the root; new: recovery con |
| 4 | ACCESSIBILITY | 7.7/10 | 10 | 7.7 | +0.1 | +0.1: measured chip 9.69:1 (was 4.39), targets 2.5.8 clean, reduced motion complete; held by WCAG 2.4.11 focus-obscured  |
| 5 | CONTENT_INTEGRITY | 8.6/10 | 9 | 7.7 | -0.1 | isolation claim verified backed by CI integration test; -0.1: synthetic chip covers 4 of 8 beats; byline unconfirmed by  |
| 6 | VISUAL_HIERARCHY | 7/10 | 7 | 4.9 | +0.2 | +0.2 visually verified: hero squint clean, record beats read card->annotation; held by eyebrow bar competing above H1, n |
| 7 | TYPOGRAPHY | 7.3/10 | 6 | 4.4 | +0.1 | +0.1: Syne/DM Sans real voice, 5xl/6xl well cut, tabular verified; eyebrow cannot be a badge at 60 chars, legal measure  |
| 8 | COLOR_AND_CONTRAST | 7.2/10 | 6 | 4.3 | +0.2 | +0.2 visually verified: dark accent collapse genuinely fixed (landing-1440-dark-00), both themes composed not inverted;  |
| 9 | SPACING_AND_RHYTHM | 6.6/10 | 5 | 3.3 | +0.1 | +0.1: 4/8 holds, legal rhythm textbook; chart void was the largest visible failure (fixed post-audit), dashboard heading |
| 10 | RESPONSIVENESS | 8.1/10 | 7 | 5.7 | +0.3 | +0.3 render-confirmed 375/768/1440 both themes: nav pill fits, box-decoration-clone clean, 320px inferred safe (186px to |
| 11 | SYSTEM_COHERENCE | 7.1/10 | 6 | 4.3 | +0.1 | +0.1: Bezel a real primitive on 3 surfaces, bento sums to 12 in all 4 states; ledger Row still 4 ad-hoc shapes, radius r |
| 12 | DISTINCTIVENESS | 7/10 | 6 | 4.2 | +0.2 | +0.2 subjective, per-route covered-logo test: passes on comparison table + tilted bezel record + inline CTA lockup; fail |
| 13 | MOTION_QUALITY | 8.6/10 | 4 | 3.4 | +0.3 | +0.3: 5 of 9 findings closed, Bezel 700/500 asymmetry proven by compiling the project's own Tailwind; surplus remains (t |
| 14 | PERFORMANCE | 8.5/10 | 6 | 5.1 | +0.7 | flat: zero animation runtime, compositor-clean; grain blend (fixed post-audit) and 640KB unoptimized PNGs offset the pro |
| 15 | PRODUCTION_READINESS | 7.6/10 | 7 | 5.3 | +0.2 | +0.2: tsc/lint/tests/build green, all states present per route; 6 hardcoded Spanish strings, echo-block duplicated acros |
| | **TOTAL (applicable)** | | 105 | **77.1** | | |

## Gates

| Gate | Value | Threshold | Result |
|---|---|---|---|
| total | 7.67 | >= 8.5 | FAIL |
| distinctiveness | 7 | >= 7.5 | FAIL |
| criticalA11y | 0 | <= 0 | PASS |
| criticalUsability | 0 | <= 0 | PASS |
| regressions | 0 | <= 0 | PASS |

Scores are judgment anchored to evidence, not measurement. Dimensions
marked n/a are excluded and the total renormalized. A deeper audit
scoring lower than a shallower one is not a regression: compare only
across equal coverage.
