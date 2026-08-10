# UX Heuristics Catalog

Living catalog. Do not apply mechanically: select the heuristics relevant to
the task, name the problem each one solves, and document exceptions when a
heuristic would hurt the primary objective (log them in
`.lexia-design/decisions.jsonl`).

Format per entry: what it predicts -> apply when -> tension -> how to verify.

## Nielsen's 10 (operational form)

1. Visibility of system status. Every async action shows state within ~100ms
   (pressed), ~300ms (progress if still running). Verify: click every action
   with network throttled.
2. Match with the real world. Labels use the user's domain vocabulary, not
   the product's internal names. Verify: read every label aloud as the
   target user.
3. User control and freedom. Destructive or modal flows have an exit: undo
   window, cancel, escape, back. Verify: try to abort every flow midway.
4. Consistency and standards. Same action, same word, same position,
   everywhere. Follow platform conventions before inventing (Jakob's law
   below). Verify: grep for synonyms of the same action.
5. Error prevention. Constrain inputs, confirm irreversibles, disable only
   what can never apply (never pre-disable submit; validate on submit).
6. Recognition over recall. Options visible or one keystroke away; no
   memorizing codes between screens. Verify: can a first-time user complete
   the primary task without instructions?
7. Flexibility and efficiency. Accelerators for experts (keyboard, recents,
   defaults) that are invisible to novices.
8. Aesthetic and minimalist design. Every element competes for attention
   with the primary task; remove or demote anything that loses that trade.
9. Error recovery. Errors say what happened, why, and the next action, next
   to where they happened, in plain language.
10. Help and documentation. Help is contextual, searchable, task-oriented;
    consistent location (WCAG 3.2.6 Consistent Help, level A).

## Laws of interaction

- Fitts's law. Time to acquire a target grows with distance and shrinks with
  size. Primary actions: large, close to the triggering context, edge/corner
  advantages on desktop. Floors: 24px desktop (WCAG 2.5.8), 44px mobile.
  Tension: density (below). Verify: measure real hit areas, not visuals.
- Hick-Hyman. Decision time grows with number and complexity of choices.
  Cap simultaneous choices; group; default the common path. Tension: expert
  surfaces tolerate more options (frequency changes the tradeoff).
- Jakob's law. Users spend most of their time on other sites; deviate from
  convention only where differentiation pays for retraining. Brand surfaces
  may spend more deviation budget than product surfaces.
- Tesler's law. Complexity is conserved; decide who absorbs it. Prefer the
  system absorbing it (smart defaults, inference) over the user (forms,
  settings). Verify: count questions asked of the user per task.
- Doherty threshold. Sub-400ms system response keeps engagement. Optimistic
  UI, skeletons that mirror final layout, delayed spinners (show after
  150-300ms, keep visible >= 300ms to avoid flicker).
- Aesthetic-usability effect. Polished surfaces are perceived as more usable
  and forgiven more. Use it deliberately; never as cover for broken flows.
- Peak-end rule. Experiences are judged by peak moment and ending. Invest in
  the completion state (success, confirmation, empty-after-clear) and the
  single most intense moment; do not spread delight evenly.
- Serial position effect. First and last items are remembered. Order nav and
  lists so primary destinations occupy the ends; bury the middle.

## Structure and comprehension

- Progressive disclosure. Show the 20% that serves 80% of cases; reveal the
  rest on demand. Verify: primary path requires zero disclosure clicks.
- Information scent. Every link/label predicts its destination; users should
  never click to find out. Verify: label-only test (can someone predict the
  target page from the label alone?).
- Cognitive load. Working memory holds ~4 chunks. Cap simultaneous action
  buttons, nav levels, sidebar sibling groups around that. Named violations:
  wall of options, memory bridge (carrying values across screens), jargon
  barrier.
- Information hierarchy. One primary message per screen; size/weight/
  position/color express importance monotonically. Verify: squint test, and
  "what do I read first/second/third" on a screenshot.
- Gestalt. Proximity groups; similarity categorizes; enclosure is expensive
  (use whitespace before boxes); alignment creates order (everything aligns
  to something on purpose); common region beats borders.
- Affordances and signifiers. Interactive things look interactive; nothing
  non-interactive imitates a control. If part of a card looks clickable, the
  whole card is clickable (no dead zones).

## Inclusive by default

- Cognitive accessibility: plain language, consistent patterns, no
  time-pressure without extension, redundant entry avoided (WCAG 3.3.7),
  accessible authentication (3.3.8: no puzzle/transcription-only logins).
- Localization/i18n: Intl.* for dates, numbers, currency; language from
  browser preferences, never IP; strings survive 1.5x expansion; RTL when in
  scope; translate="no" on brand names and code tokens.
- Keyboard navigation and focus management: full flows operable by keyboard;
  see references/accessibility/focus-and-keyboard.md.
- Touch targets: 24px min desktop, 44px mobile, >= 8px spacing between
  targets; expand hit areas, not visuals.
- Responsive: 360px to ultra-wide; safe-area insets; no accidental
  horizontal scroll; test short/average/very-long content in every text
  container.
- States: every screen designs empty, sparse, dense, loading, error,
  success, and recovery. No dead ends: always a next step.

## Conflict protocol

When heuristics collide (density vs touch targets, minimalism vs
recognition, convention vs distinctiveness):

1. Re-read the priority order in the main skill (user objective first).
2. Prefer the heuristic protecting the primary task of the primary user.
3. Frequency decides: daily-use surfaces favor efficiency and density;
   first-run surfaces favor recognition and guidance.
4. Log the exception with its reason; an undocumented exception is debt.
