# Heuristic Application Map

Which heuristics dominate per surface type and task. Use this to select 5-9
relevant heuristics instead of auditing against all of them.

## By surface type

Brand surface (landing, portfolio, campaign, storytelling):
- Dominant: information hierarchy, information scent, peak-end, serial
  position, aesthetic-usability, Jakob (for nav/forms only), states (404,
  loading), touch targets.
- Relaxed: density rules, progressive disclosure depth, efficiency
  accelerators.
- Never relaxed: contrast, keyboard, reduced motion, content integrity.

Product surface (SaaS, dashboard, tool, checkout, CRM, settings, internal):
- Dominant: visibility of status, error prevention/recovery, recognition
  over recall, consistency, Tesler, Doherty, Hick-Hyman, cognitive load,
  progressive disclosure, Fitts, URL-as-state.
- Relaxed: deviation budget (Jakob tightens: follow convention), decorative
  motion.
- Never relaxed: everything in the accessibility floor.

Hybrid surface: split the page map into brand zones and product zones and
apply each column to its zone. Never apply landing rules to an operative
panel, and never flatten a hero into a data table's austerity.

## By task within a surface

- First-run / onboarding: recognition, information scent, Tesler (system
  absorbs setup), progressive disclosure, peak-end (first success moment).
- High-frequency operation: Fitts, Hick-Hyman, efficiency accelerators,
  Doherty, density tuned up, zero decorative motion in the hot path.
- Data entry: error prevention, redundant-entry avoidance, paste-friendly,
  label clarity, inline recovery, unsaved-changes protection.
- Reading / docs: hierarchy, measure 65-75ch, scent in TOC and links,
  serial position in section ordering.
- Checkout / conversion: error prevention, status visibility, trust signals
  that are TRUE (content integrity), one primary CTA per screen, no novel
  patterns (Jakob at maximum).
- Destructive / irreversible: control and freedom (undo > confirm > type-to-
  confirm as risk grows), explicit consequence language.

## Exception documentation

An exception is legitimate when a heuristic measurably harms the primary
objective for the primary audience. Record in `.lexia-design/decisions.jsonl`:
heuristic, where, why, evidence, expiry condition. Exceptions without an
expiry condition become permanent debt; review them in every audit.
