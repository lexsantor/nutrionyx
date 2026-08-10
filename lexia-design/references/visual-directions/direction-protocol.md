# Direction Protocol

Complete this BEFORE writing code. The output is the DESIGN-BRIEF (template
in templates/DESIGN-BRIEF.md) plus a direction contract embedded in
DESIGN-SYSTEM.md. If any field reads like a mood, the direction is not
decided yet.

## Brief fields (all required)

- PRODUCT: what it is, in one sentence a stranger understands.
- AUDIENCE: who, their context, their design culture (what they read/use).
- PRIMARY TASK: the one action that defines success.
- SURFACE TYPE: brand / product / hybrid (with zone map if hybrid).
- CONTENT DENSITY: what real content exists today; what is missing.
- BRAND ATTRIBUTES: 3-5 adjectives TRANSLATED (see below).
- ANTI-REFERENCES: 3+ named things this must NOT look like (competitor
  sites, cliche registers, the category default).
- ACCESSIBILITY NEEDS: baseline AA plus any audience-specific needs
  (age, motor, cognitive, environment).
- TECHNICAL CONSTRAINTS: stack, browser matrix, performance budget,
  existing design system.
- DESIGN_VARIANCE: 1-10.
- MOTION_INTENSITY: 1-10.
- VISUAL_DENSITY: 1-10.
- SIGNATURE MOVE: one memorable, specific gesture (interaction,
  typographic move, layout motif, material treatment) named in one
  sentence and visible in the render.

## Dial semantics (constraints, not decoration)

DESIGN_VARIANCE: 1-2 install the category convention at full craft
(standing exit); 3-4 convention with one differentiator; 5-6 committed
direction from the library; 7-8 direction pushed + structural
experimentation; 9-10 experimental (brand surfaces only, never operative
tools). Product surfaces cap at 6 unless the user explicitly raises it.

MOTION_INTENSITY: 1-2 none/instant; 3-4 standard register (micro
feedback + occasional-surface transitions); 5-6 authored moments +
scroll reveals; 7-8 choreography (GSAP territory), one focal sequence;
9-10 narrative scenes (brand only, reduced-motion complete fallback).
Frequency gate still applies at every level.

VISUAL_DENSITY: 1-3 editorial air (few elements/viewport); 4-6 balanced
marketing/product; 7-8 productive density (ops tools); 9-10 terminal
density (expert daily tools). Density changes spacing tokens and type
scale, never touch-target floors.

Defaults when unstated: brand surface 6/5/4, product surface 3/3/6,
hybrid per zone. State the inferred dials in the brief; the user's
correction is cheap.

## Adjective translation (mandatory)

Vague attributes are translated into verifiable decisions before use:

- "Modern" -> which decade's modern? Name the reference register and one
  concrete type/geometry decision it implies.
- "Premium" -> restraint (fewer elements, more space, better type) or
  material richness (photography, texture)? Pick one lever.
- "Clean" -> low density + strong alignment + reduced palette. Which of
  the three dominates?
- "Futurist" -> banned until translated into an era or a technology
  reference with named artifacts.
- "Elegant" -> type contrast + spacing rhythm + muted palette. Name the
  scale and the palette rule.
- "Friendly" -> rounded geometry? warm hues? conversational register?
  Choose which, and where it must NOT apply (errors, billing, legal).

## Composition rules

- One dominant direction. Others may inform a single deliberate tension
  ("Swiss structure with one analog texture moment"), which is named in
  the contract; accumulation of styles is a defect.
- One tension, one differentiator, one signature move. More than one of
  each dilutes all of them.
- Explicit non-resources: list what will NOT be used (e.g. "no
  illustration system exists: none will be faked; no testimonials exist:
  section cut").
- The contract survives into DESIGN-SYSTEM.md; the finish audit compares
  the render against it (breaks-if lists included).

## The brief wins

If the user pinned an aesthetic, era, palette or reference, that
commitment overrides every anti-default rule in this plugin. Steering a
clear brief toward the plugin's taste is a failure mode, not taste.
Record the pin in the brief so audits respect it too.
