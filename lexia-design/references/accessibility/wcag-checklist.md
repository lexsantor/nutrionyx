# WCAG 2.2 AA Checklist for Design Work

Conformance floor: WCAG 2.2 AA (W3C Recommendation, revision 2024-12-12).
Verified 2026-07-31. WCAG 3.0 is a Working Draft and not citable; APCA was
removed from that draft in 2023 and is advisory tooling only: if APCA is
used as a perceptual second opinion, WCAG 2.2 ratios must still pass.
Accessibility criticals are release blockers (threshold:
CRITICAL_ACCESSIBILITY_ISSUES = 0).

## Perception

- 1.4.3 Contrast (AA): text >= 4.5:1; large text (>= 24px, or >= 18.66px
  bold) >= 3:1. Check BOTH themes separately; dark mode is composed, not
  inverted.
- 1.4.11 Non-text contrast (AA): UI component boundaries, focus indicators,
  state indicators, meaningful graphics >= 3:1 against adjacent colors.
- Secondary text on colored surfaces: tint from the surface hue, then verify
  ratio; generic gray on color usually fails.
- 1.4.10 Reflow (AA): no 2D scroll at 320 CSS px width (except data tables,
  maps, diagrams).
- 1.4.12 Text spacing (AA): layout survives user-forced line-height 1.5,
  paragraph 2x, letter 0.12x, word 0.16x. No clipped/overlapping text.
- 1.4.4 Resize (AA): 200% zoom usable. Never disable zoom
  (user-scalable=no is a detector block) [a11y/user-scalable-no].
- 1.4.1 Use of color (A): color is never the only signal for state, links,
  or chart series; pair with icon, weight, underline, pattern or text.

## Operation

- 2.1.1 Keyboard (A): every flow completable by keyboard; no traps (2.1.2).
- 2.4.7 Focus visible (AA) + 2.4.11 Focus not obscured minimum (AA, new in
  2.2): visible indicator, not fully hidden by sticky bars/overlays.
  Removing outline without replacement is a finding
  [a11y/outline-none-no-replacement]. Use :focus-visible.
- 2.5.8 Target size minimum (AA, new in 2.2): >= 24x24 CSS px, with the
  five spec exceptions (spacing circles, equivalent control, inline text,
  user-agent default, essential/legal). Practical floors: 24 desktop,
  44 mobile, >= 8px between adjacent targets.
- 2.5.7 Dragging movements (AA, new in 2.2): any drag operation has a
  single-pointer alternative.
- 2.5.1 Pointer gestures (A): multipoint/path gestures have single-pointer
  alternatives.
- 2.3.1 Three flashes (A): nothing flashes more than 3 times/second.
- 2.3.3 Animation from interactions is AAA: treat as best practice; the AA-
  testable hook for motion is honoring prefers-reduced-motion (technique
  C39). See references/motion/principles.md.
- 2.4.1 Bypass blocks (A): skip link to main content.

## Comprehension and input

- 3.3.1 Error identification (A) + 3.3.3 Error suggestion (AA): errors
  identified in text next to the field, with a suggested fix; on submit,
  move focus to the first error.
- 3.3.2 Labels (A): visible labels, programmatically associated; placeholder
  is an example pattern, never the label [a11y/placeholder-as-label].
- 3.3.7 Redundant entry (A, new in 2.2): never ask for the same information
  twice in a flow (auto-fill or offer to reuse).
- 3.3.8 Accessible authentication minimum (AA, new in 2.2): no cognitive
  test (transcription, puzzles) as the only login path; support paste and
  password managers [a11y/paste-blocked].
- 3.2.6 Consistent help (A, new in 2.2): help mechanisms in the same
  relative location on every page.
- 3.2.1/3.2.2 On focus / on input (A): focusing or typing never triggers
  unexpected context changes.
- 1.3.5 Input purpose (AA): autocomplete attributes on identity fields.

## Semantics

- Native elements before ARIA; no ARIA is better than bad ARIA (APG).
- 4.1.2 Name/role/value (A): icon-only buttons have accessible names
  [a11y/icon-button-no-name]; decorative icons aria-hidden.
- 1.3.1 Info and relationships (A): real headings h1-h6 in order; lists as
  lists; tables with headers; landmarks (header/nav/main/footer).
- Clickable divs/spans are a finding [a11y/div-click]: use button/a. Real
  links for navigation (Cmd-click must work).
- 4.1.3 Status messages (AA): async status via polite aria-live regions.
- tabindex > 0 is a finding [a11y/tabindex-positive]. Note: 4.1.1 Parsing
  was removed in WCAG 2.2; do not cite it.

## Delivery gate

Before delivering, verify at minimum: keyboard walk of the primary flow,
contrast spot-check of every text/surface pair in both themes, zoom 200%,
reduced motion honored, focus visible everywhere, names on all controls.
Automated tooling (axe, Lighthouse) catches ~30-40% of issues; treat green
tooling as necessary, never sufficient.
