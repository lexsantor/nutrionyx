---
name: design-system
description: >
  This skill should be used to define or evolve a project's visual system:
  "create design tokens", "define the visual direction", "set up
  typography/color/spacing system", "document the design system",
  "make the UI consistent". Produces the direction contract, token set
  and DESIGN-SYSTEM.md. Usually invoked by the lexia-design orchestrator;
  also directly useful on its own.
metadata:
  version: "0.1.0"
---

# Design System

Turn a completed brief into a coherent, documented visual system. Input:
`.lexia-design/DESIGN-BRIEF.md` (if absent, run the direction protocol
first: `${CLAUDE_PLUGIN_ROOT}/references/visual-directions/direction-protocol.md`).

## Order of definition

1. Direction contract. From the chosen direction
   (`${CLAUDE_PLUGIN_ROOT}/references/visual-directions/directions.md`):
   thesis (2 sentences), tension (1), differentiator (1), signature move
   (1), breaks-if list (5-8 falsifiable items), non-resources list. This
   contract is auditable text: vague entries are defects.
2. Typography. Families (with license status noted), scale (name the
   ratio or the hand-tuned steps), weights used, leading per size band,
   tracking per size band, measure limits, tabular-numeral contexts.
   Reflex-face check against
   `${CLAUDE_PLUGIN_ROOT}/references/anti-slop/model-priors.md`.
3. Color. Derive from the direction's color logic: field(s), ink
   hierarchy (hue-tinted, never generic gray on color), ONE accent +
   lock, full semantic set (success/warning/danger/info), both themes
   composed separately (dark is not inverted light). Record measured
   contrast for every text/surface pair
   (`${CLAUDE_PLUGIN_ROOT}/references/accessibility/wcag-checklist.md`).
4. Spacing and rhythm. Base unit (4 or 8), scale, section rhythm,
   container widths, VISUAL_DENSITY dial applied here; more space above
   headings than below.
5. Geometry. Radius tokens (concentric: child <= parent), border
   weights, shadow system (offset + blur from one light source, or none),
   z-elevation map.
6. Interaction language. Focus ring spec, hover/active/selected/disabled
   treatments, motion tokens (durations + easings from
   `${CLAUDE_PLUGIN_ROOT}/references/motion/principles.md`) even if
   MOTION_INTENSITY is low: instant is also a spec.
7. Density and breakpoints. Breakpoint set, density shifts per
   breakpoint, touch-target floors per pointer type.

## Token discipline

- Emit tokens in the project's native mechanism (CSS custom properties,
  Tailwind theme, styled tokens file): never a parallel system.
- Every visual value in components resolves to a token; off-token values
  found later are audit findings [system/hardcoded-colors].
- Name tokens by role (--surface-raised, --ink-muted), not by value
  (--gray-300 as a role name is debt).

## Documentation

Write/update `.lexia-design/DESIGN-SYSTEM.md` from the template
(`${CLAUDE_PLUGIN_ROOT}/templates/DESIGN-SYSTEM.md`): contract, tokens,
component inventory with states, external components registry (origin,
license, modifications:
`${CLAUDE_PLUGIN_ROOT}/references/component-libraries/policy.md`),
exceptions with reasons. On NEW visual worlds, write the full document
AFTER the first build passes review, from the built reality; update
incrementally thereafter. Keep decisions and their why in
`.lexia-design/decisions.jsonl`.

## Consistency maintenance

When touching an existing system: diff proposed changes against the
current DESIGN-SYSTEM.md; classify each divergence as error /
inconsistency / debt / deliberate exception; never flatten a deliberate
exception without asking; log everything.
