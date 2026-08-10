# Model Priors and Convergence Breaking

Language models have measurable stylistic priors. Left alone, independent
runs converge on the same few outputs. This file makes the priors explicit
so they can be spent deliberately instead of by reflex.

## Known priors to treat as "already spent"

- Warm/artisan/bookish briefs -> cream paper, display serif, brass/espresso
  accents, lamplight warmth. The strongest cross-validated prior. The first
  palette that comes to mind for these briefs has been produced thousands
  of times; require one alternative exploration before accepting it.
- Tech briefs -> dark surface, neon/purple-blue gradient, glass cards, orbs.
- Any brief -> Inter/system sans + slate grays + centered hero + three
  cards + soft shadows + generous radius.
- "Creative" briefs -> Fraunces-class serif + off-white + editorial cliches.
- Dashboard briefs -> dark sidebar, stat cards with sparkline, blue accent.

Using one of these is allowed WHEN the direction contract argues it from
content and brand, not category habit. "It's a tech product" is category
habit. "The product monitors GPU clusters and the terminal aesthetic
mirrors its users' actual environment" is an argument.

## Convergence-breaking procedure (deterministic, no fake randomness)

A model simulating a dice roll reproduces its biases; do not pretend to
randomize. Instead:

1. Derive 5-7 candidate directions from the audience's actual culture:
   their artifacts, publications, notation systems, physical environments,
   identity programs. At least three different material families.
2. Explicitly exclude: the category's predictable default AND its
   predictable opposite (both are reflexes).
3. Argue each candidate in two sentences against the brief; pick by
   argument strength against the DESIGN_VARIANCE dial; record runners-up
   and why they lost in DESIGN-BRIEF.md.
4. Standing exit: always offer the category standard played straight. If
   the user chooses convention, execute convention at full craft against
   named competitor benchmarks, with no smuggled quirk. Distinctiveness is
   never forced on a user who asked for the familiar thing.
5. The user's explicit choice beats everything ("the brief wins").

## Register discipline

- The model's own prose leaks into UI copy: aphoristic cadence, triadic
  lists, "Not X. Not Y. Just Z." constructions. Audit visible strings for
  generated-text rhythm.
- The model over-decorates when uncertain. Uncertainty about content is
  resolved by asking or labeling, never by adding ornament.

## Honest limitation

These priors describe current frontier models as observed through mid-2026
production usage (see SOURCES.md). They drift with model generations. When
audits stop finding a listed prior in fresh output, propose removing it via
/lexia-design:update instead of keeping dead rules.
