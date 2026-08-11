# Field Learnings

Cross-project learnings harvested from full audit-and-fix cycles run with
this plugin (source: Nutrionyx, a clinical multi-tenant SaaS, 2026-08 -
four-tier remediation from 7.41 to ~8.6). Everything here is
project-agnostic; candidates for detector rules, reviewer-prompt lines,
or skill guidance in future versions.

## Audit process

1. **Multi-lens beats single-pass.** Four parallel reviewers with
   disjoint lenses (visual/brand, production checklist, motion, UX/a11y)
   found materially different defect sets with almost no overlap in
   findings but strong overlap in *diagnosis*. Where two lenses converge
   on the same file independently, confidence is near-certain - schedule
   those first.
2. **Verify detector output before reporting it.** In one full cycle,
   every mechanical placeholder-as-label flag was already mitigated
   (sr-only labels existed) and the "fake status dot" flags were correct
   skeletons with `role="status"`. Regex tripwires need an
   agent-verification pass; report verdicts (TRUE_POSITIVE / MITIGATED /
   FALSE_POSITIVE), never raw flags.
3. **A deeper audit scoring lower than the last one is not a
   regression.** New lenses surface new defect classes (trust surface,
   timezone drift, revalidation targets) that earlier cycles never
   examined. Record the score with its coverage, or the number is
   meaningless across cycles.
4. **Tier by effort-impact, fix tier 1 completely before touching
   tier 2.** Bugs and launch blockers first (a day of S-effort items
   moved the estimate half a point); system coherence second; structure
   third; polish last. Mixed-tier fixing loses the audit trail.
5. **Waivers must be durable.** A decisions log (jsonl: id, decision,
   why, source) prevents re-flagging deliberate choices across cycles
   and across agents. Every accepted deviation gets an entry the same
   day it is accepted.
6. **Iterate on the same reviewers.** Re-scoring with the agents that
   produced the findings (not fresh ones) keeps the scale stable and
   lets "fixed" claims be verified against the original complaint.

## Defect classes worth a permanent check

### Trust surface (launch blockers masquerading as polish)

7. **A product handling EU personal data without /privacy, /terms, a
   favicon and per-route metadata is not unpolished - it is
   unlaunchable.** GDPR Art. 13 requires the privacy notice at the point
   of data collection: link it from every signup-like form. Check for:
   legal routes, favicon file, `metadataBase` + title template, og
   image, robots.txt excluding private areas.
8. **Provisional legal text is acceptable pre-launch if labelled as
   such** (version + date + "fiscal identification pending"), and it
   must never invent company identifiers. Flag for lawyer review; do not
   block the build on it.

### Theming and tokens

9. **Custom theme toggles desync from `dark:` variants.** If the app
   toggles via `[data-theme]` (or a class) but Tailwind's `dark:` keys
   off `prefers-color-scheme`, every `dark:` utility renders wrong
   whenever app theme != OS theme. Tailwind 4 fix is one line:
   `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));`
   Detector: `dark:` utilities present + a `data-theme` writer + no
   `@custom-variant dark` = serious.
10. **Near-duplicate tokens collapse ramps.** Two grays a few RGB points
    apart (ink-subtle #5c7386 vs ink-tertiary #5b7080) render as one
    level; the "3-step text ramp" is fiction. Measure deltas between
    same-role tokens; delete or genuinely separate.
11. **An accent that is functionally ink deletes every accent moment.**
    If `primary` and `ink` are within ~2:1 contrast of each other,
    `hover:text-primary`, hero highlights and selected states are
    invisible. Either give primary real chroma or stop using it as a
    text accent. Check: contrast(primary, ink) as a ratio, not by eye.
12. **Every hardcoded rgba() shadow is a dark-mode bug.** Shadows belong
    in themed tokens, tinted toward the canvas hue (never pure black in
    dark). One `--el-bezel`-style token beats four bespoke values that
    drift.

### Motion

13. **The de-facto second motion system.** Declared token systems (one
    curve, one duration palette) silently coexist with dozens of bare
    `transition-colors` sites running framework defaults. Tailwind 4
    kills the whole class of drift with two theme keys:
    `--default-transition-duration` and
    `--default-transition-timing-function`. Set them; then only
    deliberate durations remain in markup.
14. **Broken press is invisible in code review.** `active:scale-*`
    paired with `transition-colors` (transform absent from the property
    list) snaps with zero easing. Detector rule: `active:scale` in a
    class list whose `transition-[...]`/`transition-*` does not cover
    `transform` = finding. Hand-rolled buttons are where this lives;
    migrating them to the house Button fixes press, focus and pending
    states at once.
15. **Hover color at the slow tier feels broken.** A 500ms
    background/color hover reads as lag even under a front-loaded
    curve; hovers want 150-250ms while transform/shadow lifts keep the
    slow tier. Split per property, or give buttons the fast tier
    entirely (press override at ~150ms stays).
16. **`filter: blur()` in entrance transitions is a paint tax on every
    section.** Reveal-on-scroll should be transform+opacity only.
17. **Reduced-motion blocks that zero durations must also cap
    `animation-iteration-count`** - a 0.01ms infinite loop still ticks
    every frame.
18. **The richest interactive surface is usually motion-dead.** Teams
    polish landing motion and ship the core clinical/data widget with
    zero transitions (view swaps, selection states). Audit interaction
    motion on the highest-value component explicitly.

### Data correctness in "today" products

19. **Server-local midnight is a clinical bug.** Any adherence/streak
    /"today" feature computed with `new Date().setHours(0,0,0,0)` or
    `toDateString()` drifts for users whose wall-clock timezone differs
    from the server (UTC on Vercel): between midnight and server
    midnight, today's ring, day highlight and dose date are wrong. All
    "today" logic must route through one timezone helper module
    (`xxxDayStart`, `sameXxxDay`, `xxxWeekdayIndex`). Grep for
    `toDateString()` and `setHours(0, 0, 0, 0)` in product code.
20. **`revalidatePath` must target where the UI lives, not where the
    feature started.** Actions keep revalidating the route the form
    lived on two refactors ago; the symptom (stale list after a
    mutation) only shows in manual testing. Cross-check every
    revalidatePath argument against the page that renders the mutated
    data.

### Structure (App Router specifics, generalizable)

21. **Shell in the layout, not in pages.** A sidebar rendered per-page
    remounts on navigation and vanishes under the root loading
    boundary. Route groups solve the guard-exception problem (the
    "create your org" page must not sit behind the org guard that
    redirects to it).
22. **Guards belong in one cached helper.** `React.cache()` around the
    session→role→org resolution dedupes layout+page calls and deletes
    per-page boilerplate. Five copies of a guard is five places for the
    next auth bug.
23. **Detail pages accrete waterfalls.** Every slice adds "one more
    await"; the heaviest page ends with 15-20 sequential round-trips.
    After the entity resolves, everything else is independent: one
    `Promise.all`. Audit rule: count awaits between the entity fetch
    and the JSX.
24. **Per-segment loading/error boundaries are part of the design
    system.** A single root skeleton shaped like one area is wrong for
    every other area, and a root error boundary unmounts the shell.
25. **Uploads that outgrow server-action body limits stay route
    handlers - but submit them via fetch.** Native multipart form posts
    reload the page and park errors in sticky query params. A small
    client uploader (pending, double-submit guard, inline error,
    `router.refresh()`, JSON responses) fixes the UX without fighting
    the limit. Keep one shared component.

### Accessibility patterns that recur

26. **sr-only radio/checkbox cards hide keyboard focus.** Wrapping-label
    cards need `has-[:focus-visible]:` styles (or `peer-focus-visible`
    when sibling-structured). Every styled selection-card group gets
    this check.
27. **View toggles are not tabs.** `role="tablist"` without tabpanels
    and arrow-key behavior is a broken contract; a front/back or
    filter toggle is buttons with `aria-pressed`.
28. **Conditionally mounted `aria-live` regions do not announce.** The
    live region must exist from first render; swap its children.
29. **Programmatic focus targets for step flows.** Multi-step forms
    that redirect per step reset focus to `<body>`; the new step's
    heading takes `tabIndex={-1}` and receives focus on mount. No
    visible ring needed (not keyboard-reachable) - and do not add
    `outline-none`, which trips detectors and is unnecessary.
30. **Skeletons are status.** `role="status"` + `aria-busy` + sr-only
    text - and the text goes through i18n like any other string;
    loading files are where hardcoded strings hide.
31. **Native `confirm()` has exactly one legitimate home: unsaved-
    changes navigation guards** (symmetry with the native beforeunload
    dialog, and arbitrary links cannot be two-stepped). Everything else
    destructive uses the in-flow two-step confirm (arm → confirm/cancel
    with pending), or type-to-confirm for irreversible erasure.

### Product-surface parity

32. **The signature must reach the paid surface.** Landings accumulate
    the brand signature (bezels, display type, motion); the console
    where users spend their day stays generic stacked cards. Exporting
    one signature element to the app's identity moment (a header, a
    protagonist metric) moves distinctiveness more than another landing
    pass.
33. **Stat tiles drift apart across areas.** Same-role data (dashboard
    numbers, chart headlines) must share one treatment
    (display face + tabular-nums + size); audit them as a set.
34. **Empty states are onboarding.** A bare "no items" line at the
    exact moment a user needs direction is a lost activation; icon +
    what-this-is + the next action, everywhere a first-run user lands.
35. **Row hover that promises a click the row does not honor** (only
    one cell links) is an affordance lie: make the row navigate or
    drop the hover.

### Asset pipelines

36. **Calibrate overlays against the image's alpha channel, not by
    eye.** For coordinate overlays on generated imagery (maps, bands,
    annotations), measure the silhouette per row from the PNG alpha
    (stdlib-decodable) and derive coordinates; per-variant tables (e.g.
    male/female figures) come from measuring each render, not from
    scaling one.
37. **Generated asset variants need a reference chain.** Subsequent
    views/variants generate with the first accepted asset as the style
    reference; material/lighting/framing consistency does not survive
    text-only prompts.
