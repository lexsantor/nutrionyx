# Scoring Rubric

Fifteen dimensions, 0-10 each. Scores feed
`scripts/lexia-design-score.mjs gate`, which enforces thresholds and records
history. Honesty rules first.

## Honesty rules

- Never tune scores to declare success. The gate exists to be failed.
- Every score cites evidence: a screenshot, a file:line, a measured value,
  a walked flow. A score without evidence is invalid.
- Subjective dimensions (DISTINCTIVENESS, parts of VISUAL_HIERARCHY,
  MOTION_QUALITY) are marked subjective in the report; state the judgment
  basis. Do not dress taste as measurement.
- Unrendered UI cannot receive visual scores: mark "not visually verified"
  and exclude from the total (the gate renormalizes; see below).
- A dimension that does not apply (MOTION_QUALITY on a zero-motion
  surface) is scored n/a, not 10; the gate renormalizes the total.

## Anchor scale (applies to every dimension)

- 0-3: broken; blocks real use or violates a hard rule.
- 4-5: functions with significant friction or violations; would embarrass
  a senior review.
- 6-7: competent; standard-quality shipping work with known flaws.
- 8: strong; deliberate, consistent, verified; minor flaws only.
- 9: excellent; a practitioner would study it.
- 10: reserved; do not award without exceptional evidence.
Most honest first iterations land 5.5-7.5 overall. A first-pass 9 is a
scoring failure, not a design success.

## Dimensions

1. TASK_CLARITY: can the primary user complete the primary task without
   instructions? Evidence: walked flow, steps counted, dead ends found.
2. INFORMATION_ARCHITECTURE: structure matches the user's mental model;
   navigation predicts destinations (scent); URL reflects state.
3. USABILITY: heuristic violations found and their severity (ux-laws.md
   selection); interaction costs; error recovery. Criticals here gate
   delivery (CRITICAL_USABILITY_ISSUES = 0).
4. ACCESSIBILITY: wcag-checklist.md pass rate; keyboard walk; contrast
   measurements; reduced motion. Criticals gate delivery (= 0).
5. CONTENT_INTEGRITY: zero fabrications; slots labeled; register matches
   surface; filler test passed. Fabrications are automatic <= 3.
6. VISUAL_HIERARCHY: first/second/third read on each screen matches
   intent (squint test on screenshots); one primary per screen.
7. TYPOGRAPHY: scale system coherence, measure, leading, tracking,
   pairing logic, tabular nums where comparing; no reflex faces.
8. COLOR_AND_CONTRAST: palette follows the direction's color logic;
   accent lock; semantic colors reserved; measured ratios both themes.
9. SPACING_AND_RHYTHM: token rhythm held (4/8); heading space above >
   below; density matches dial; alignment intentional everywhere.
10. RESPONSIVENESS: 360/768/1440/ultra-wide verified; no accidental
    scroll; safe areas; content-length stress passed.
11. SYSTEM_COHERENCE: tokens used (no off-token values); components
    consistent across screens; direction contract's breaks-if list clean;
    external components registered and retokenized.
12. DISTINCTIVENESS: interchangeability test (cover the logo); signature
    move present and visible; anti-references avoided; direction
    recognizable from a single screenshot. Subjective: justify.
13. MOTION_QUALITY: frequency gate respected; durations/easings within
    bands; interruptible; reduced-motion complete; one authored moment
    rather than ubiquitous entrances; cleanup verified.
14. PERFORMANCE: compositor-only animation; image dimensions; font
    loading; bundle deltas justified; interaction latency; CWV where
    measurable.
15. PRODUCTION_READINESS: builds clean; typechecks; lints; no TODOs or
    placeholder code; states all implemented; maintainable without this
    plugin (readable, conventional, documented).

## Report format (per dimension)

score | evidence (concrete) | severity of worst finding | affected
file/component | recommendation | status after fix (filled on the next
iteration).

TOTAL = mean of applicable dimensions. Gate thresholds: TOTAL >= 8.5,
DISTINCTIVENESS >= 7.5 (brand surfaces; product surfaces may accept 6.5
when the user chose the standing exit: record that choice), zero critical
a11y/usability, zero visual regressions vs previous iteration.
