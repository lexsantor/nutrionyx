# DESIGN AUDIT - cycle 2026-08-10 (lexia-design full cycle, iterations 1-2)

Render: none available (Chrome extension disconnected; app interior needs a
session). All visual judgments code-inferred - NOT VISUALLY VERIFIED.

## Scores (iter 1 -> iter 2)

TASK_CLARITY 7.0->8.0 · IA 6.0->7.5 · USABILITY 5.5->7.0 ·
ACCESSIBILITY 5.5->7.5 · CONTENT_INTEGRITY 8.5->9.0 ·
VISUAL_HIERARCHY 6.5->7.4 · TYPOGRAPHY 7.4->7.6 · COLOR 6.8->7.6 ·
SPACING 7.0->7.4 · RESPONSIVENESS 6.5->7.0 · SYSTEM_COHERENCE 5.8->7.2 ·
DISTINCTIVENESS 7.4->7.4 · MOTION_QUALITY 7.4->8.6 · PERFORMANCE 7.0->7.9 ·
PRODUCTION_READINESS 5.0->6.5

GATE: TOTAL 6.62 -> 7.57 (min 8.5 FAIL) · DISTINCTIVENESS 7.4 (min 7.5
FAIL) · criticals 0/0 PASS · regressions 0 PASS · VERDICT continue
(2 of 4 iterations used).

## Fixed in iteration 2 (all reviewer-verified)

Mobile patient nav (the sole critical, WCAG 1.4.10) · ink-tertiary and
field-border contrast tokens · accent-color · loading/error/404 boundaries
(es) · patient-detail reordered to the primary task · skip link (console) ·
sr-only message senders · silent-failure paths surfaced · wizard exit +
progressbar name + DOB chevron + dvh · one container width + one gutter ·
Card static-by-default with interactive opt-in · Button on the house motion
curve · fast press everywhere · scaleX progress bars · reduced-motion
delay · sample-data chips repeated on the landing · delta valence
neutralized · invite link absolute, jargon removed · autocomplete tokens.

## Open backlog (owner-priority, product features not polish)

1. Password recovery flow (serious; auth feature).
2. Unsaved-changes guard on diet/routine editors (serious).
3. Patient table search/pagination (dense caseloads).
4. Landing scroll rhythm: 2-3 authored beats across the 10 record sections
   (the ceiling on VISUAL_HIERARCHY + DISTINCTIVENESS).
5. Erase type-to-confirm; photo/document delete confirm-or-undo.
6. Skip link on patient/landing shells; radius token scale; --el-xl shadow
   token; PhotosCard tile dedup; progress-track color unify; profile the
   landing grain+blur stack when rendering is available.

---

# DESIGN AUDIT - cycle 2026-08-11 (exhaustive multi-skill audit)

4 parallel reviewers (visual/brand, redesign checklist, motion, UX/a11y) +
lexia detector + impeccable detector. Code-inferred (Chrome ext down).

## Scores (this cycle, mapped to the 15 gate dimensions)

TASK_CLARITY 8.0 · IA 7.5 · USABILITY 7.0 · ACCESSIBILITY 7.0 ·
CONTENT_INTEGRITY 9.3 · VISUAL_HIERARCHY 7.0 · TYPOGRAPHY 7.4 ·
COLOR 6.6 · SPACING 8.1 · RESPONSIVENESS 7.5 · SYSTEM_COHERENCE 7.3 ·
DISTINCTIVENESS 6.8 · MOTION_QUALITY 8.0 · PERFORMANCE 7.5 ·
PRODUCTION_READINESS 6.2 -> TOTAL 7.41. Deeper audit than iter2's 7.57;
not a regression, new surface (legal/trust, accent=ink, revalidate bug,
tz drift, motion second-system).

## Detector verdicts

All 6 placeholder-as-label flags MITIGATED (labels exist). loading.tsx
pulse MITIGATED (aria-busy + sr-only; residue: no role=status, hardcoded
"Cargando…"). Float RM waiver holds (global !important block covers
inline shorthand; missing animation-iteration-count:1 is the only gap).

## Top confirmed defects (cross-agent convergence)

1. No legal surface: /privacidad, /terminos, favicon, per-route metadata
   missing (EU health SaaS, GDPR Art 13). CRITICAL.
2. dark: utilities key to prefers-color-scheme, theme toggles [data-theme];
   no @custom-variant dark -> wrong grain/bezel when app!=OS theme.
3. revalidatePath("/panel") but invite UI lives on /panel/pacientes ->
   stale invitations after invite/cancel.
4. UTC-vs-Madrid "today" drift in weightToday/proteinOnDay/diet-day/dose
   date (00:00-02:00 window); scheduling/time.ts helpers unused there.
5. Auth pages: absolute -inset-40 in non-positioned main -> horizontal
   scroll; min-h-screen not dvh.
6. sr-only radio cards in medicacion forms: keyboard focus invisible.
7. Hero highlight text-primary ~= ink: emphasized phrase invisible.
8. Accent is functionally ink (COLOR 6.6 ceiling).
9. Patient detail: 12-13 identical stacked cards + ~20 sequential awaits;
   ConsoleShell in pages not layout; only root loading/error boundaries.
10. Second motion system: ~30 bare transition-colors sites + broken press
    on hand-rolled buttons (transform not in transition list); body map
    interactions motion-dead.

## Verdict

Strengths: copy 9.3, RM safety 9.0, motion perf 8.8, interaction states
8.6, spacing 8.1. Levers: trust surface (day), patient-detail restructure
(bento+Promise.all+layout), export signature to console, give accent a
voice. Projected: Tier1 ~7.9, +Tier2 ~8.3, +Tier3 ~8.7 (gate pass).

## Tier 1 applied 2026-08-11 (commit 76cad9b, deployed)

Trust surface: /privacidad + /terminos (provisional legal text, fiscal id
pending), icon.svg, opengraph-image, per-route titles + template,
metadataBase, robots.txt, legal links (footer + sign-up +
accept-invitation). Fixes: @custom-variant dark -> [data-theme];
revalidatePath /panel/pacientes; Madrid-day helpers (madridToday/
sameMadridDay/madridWeekdayIndex) wired into weightToday, diet/training
todayIndex, doneToday, dose todayISO, proteinOnDay; auth overflow-x-clip
+ min-h-dvh sweep; has-[:focus-visible] on medication radio cards; hero
highlight on primary-subtle chip; animation-iteration-count in RM block.
Estimated total after tier 1: ~7.9. Next: tier 2 (system coherence).

## Tier 2 applied 2026-08-11 (commit 5f676e7, CI green, deployed)

One motion system: ease-house token, default duration 200ms + default
timing = house curve in @theme (kills ~30 default-ease sites), buttons
500->200ms hover (press 150 kept, Card/TILE lift 500 kept), raw beziers
swept, upload buttons -> <Button>, stepper/cancel get transform in
lists, destructive hover via --c-error-hover. Color: light primary
#24405f family (accent has a voice), dark shadows tinted, --el-bezel
token replaces 4 bespoke slate shadows, ink-tertiary deleted. Body map:
legible labels (11/12u, ink-muted), aria-pressed toggle (tablist
removed), bigger hit rects, size-9 close, persistent aria-live,
fade/stroke transitions. Landing: nav pill -> ButtonLink, lg size for
hero CTAs. Stat tiles + weight headline on font-display tabular-nums.
Estimated total after tier 2: ~8.3. Next: tier 3 (patient-detail
restructure + signature export + uploads-as-actions).

## Tier 3 applied 2026-08-11 (commit e734352, CI green, deployed)

Console: panel/(console)/ route group; layout owns requireSpecialistOrg
(React cache) + ConsoleShell (persistent sidebar); per-segment loading
(console + mi-espacio) and console error boundary; 5x guard boilerplate
deleted. Patient detail: 12-col bento (7/5 pairs), one Promise.all for
14 reads, double-bezel identity header (signature exported to console),
Row max-w-2xl dead zone removed. Dashboard: protagonist active-patients
tile. Uploads: fetch-submitted route handlers (UploadForm: pending,
double-submit guard, inline error, router.refresh; JSON responses, no
sticky query params). Wizard: month-clamped day options, labelled empty
options, native pattern, focus-to-heading per step. Invitations: Card +
copy button + break-all + dead-end CTA; composed empty states (agenda,
pacientes). Estimated total after tier 3: ~8.6-8.7 (gate 8.5 pass,
pending a re-score with rendering). Remaining: tier 4 polish + product
backlog (password recovery, unsaved-changes guard, search/pagination).

## Tier 4 applied 2026-08-11 (commit d7dbdc6, CI green, deployed)

Reveal: blur dropped, 700->500ms. Threads scroll to newest
(ScrollAnchor); composer success announced (role=status). Weight chart
first/last date anchors. Admin: codes table overflow wrapper, two-step
revoke with pending. Wizard submit pending label. Patients row hover
dropped (only the name links). Panel photo alt uses photos.photoAlt.
Overlay deletes size-9. Landing strokes: icons 2, small checks 3.
Loading skeletons role=status + common.loading (i18n leak closed).
Nav-link active keeps transition; theme toggle explicit duration-150.

ALL FOUR TIERS APPLIED. Audit-derived work complete; remaining items
are product backlog (password recovery, unsaved-changes guard, patient
search/pagination, self-booking, Resend domain, billing) plus an
optional lexia re-score with real rendering (iterations 3-4 unused).

---

# Audit cycle 2026-08-12 (plugin 0.7.3, iteration 2 gate)

LEXIA SCORE 75.4/100 (C) - .lexia-design/DESIGN-REPORT.md. Coverage:
code-inferred (NOT RENDERED), detector 0.7.3 + verification, 3 fresh
plugin reviewer agents, measured contrast, correctness lens. Gates:
total 7.49 FAIL, DIST 6.8 FAIL, criticals 0/0 PASS. 6 dims improved vs
Aug-10 (PR +0.9, RESP +0.8, IA +0.5); visual dims down on new lenses.

Tier 1 applied same day (commit d631af9, CI green, deployed): missing
panel.metrics.title key; dark accent de-collapse (#8dbde6); bento
photos<->citas reorder (6/6 + 5/7 rows); RecordSection flip template
(order + asymmetric tracks bug on 3 landing sections); madridDayStart
in cron dose-dedupe + training dedupe + 28d window; weight date capped
client+server; sample chip to ink-muted (9.69:1); skip target on
pre-assessment screen. Projected ~77.5; re-score pending (needs same
reviewers + ideally render).

Pending tiers: T2 forms contract (live regions persistentes, React19
error-reset, cita 2-step, hover 500ms stragglers, tabular-nums ledger,
patient-home Promise.all), T3 identity (bezel dashboard, warning-as-
data, detail hierarchy, DESIGN-SYSTEM.md fill, copy density), T4
verification (render, byline owner confirm, React19 repro).

## Tier 2 applied 2026-08-12 (commit da7eec5, CI green, deployed)

Forms contract: persistent role=status wrappers across 15 forms
(session-form restructured); React19 error-reset data loss fixed on
diet/routine editors + composers + note-form (actions echo values,
fields re-hydrate via defaultValue). Destructive: invitation +
appointment cancel two-step arm/confirm; sub-24px controls to 32px.
Motion register: TILE/photos lift lists trimmed to transform+shadow
(instant theme swap, body fade deleted); export pill/wizard-back/review
cards on fast tier; review edit reveals on focus-visible; house press on
pre-assessment CTA + ajustes consent; CTA chip 300ms; scroll anchor
follows appended messages. tabular-nums on detail Row + dose history.
Patient home: 10 reads in one Promise.all. Reference set stored
(Healthie, Nutrium + state-of-the-art delegation).
Projected ~79; re-score with same reviewers pending. Next: T3 identity
(bezel dashboard, warning-as-data, detail hierarchy, DESIGN-SYSTEM.md,
copy density) then T4 verification (render, byline confirm).

## Tier 3 applied 2026-08-12 (commit f01b000, CI green, deployed)

Signature: Bezel extracted to ui/bezel.tsx (concentric radii via radius
prop); consumed by landing beats + console dashboard protagonist tile
(the daily-first screen previously had zero identity). Detail page: 3
single-button cards -> one "Plan y seguimiento" ledger; notes 12->7 to
pair with medication; report heading font-display xl (primary task wins
the squint test); rows still sum to 12. Color semantics: warning-as-data
removed from the composition bar (surface-4); admin status chip off the
4.39:1 pair. Console: mobile active nav adopts desktop grammar;
dashboard gap-6 rhythm. DESIGN-SYSTEM.md filled from built reality
(thesis, 8-item BREAKS IF, scales, every measured contrast pair both
themes, component inventory, motion tiers) - the contract is auditable
for the first time. agenda.emptyHint corrected.

Waivers recorded (owner-facing, revisit on render): landing radial halos,
problem triptych. Copy proposals NOT applied (brand voice needs owner
sign-off): negative-parallelism density x5 on the landing.

Projected ~80-81 with DISTINCTIVENESS reaching the 7.5 gate. Remaining:
T4 verification (render, byline confirm, React19 repro) + known issues
(ledger Row x3 treatments, hardcoded auth strings, theme-toggle name).

---

# Iteration 3 — 2026-08-12 (RENDERED)

LEXIA SCORE 77.1/100 (C) · TOTAL 7.67 (+0.18) · verdict continue.
Gates: total FAIL (>=8.5), distinctiveness 7.0 FAIL (>=7.5), criticals
0/0 PASS, regressions 0 PASS. 12 of 15 dimensions improved.

Render: Playwright (scratchpad/render/shoot.mjs) vs production, 84
captures at 375/768/1440 x light/dark with real scrolling. Public
surfaces only; mi-espacio + panel + admin stay code-only (no
authenticated session).

## What the render caught that code review could not

1. nav sign-in link never hid below sm: `hidden` and ButtonLink's own
   `inline-flex` have equal specificity, Tailwind emits inline-flex last.
2. hero highlight chip split across lines rendered as two broken
   rectangles (needed box-decoration-clone).
3. eyebrow badge wrapped inside a pill radius with a mis-centred dot.
4. WeightChart stretched ~750px tall in the landing bezel; the first fix
   (max-h-64) traded it for a horizontal void painting 12% of the card —
   a self-inflicted regression the reviewer caught. Correct fix: the 2:1
   aspect is right for app tiles, only the landing's full-width usage was
   wrong, so the container is constrained there.
5. floating nav ghosted content (translucent enough to erase, opaque
   enough to show through) over the comparison table and a patient name.

## Fixed after the reviewers scored (verify next iteration)

chart regression · nav occlusion · auth screens adopt Bezel (BREAKS IF #3
closed at both ends) · focus-ring off ink-subtle onto the accent ·
semantic colour off quantities (console rate bar, chart delta) · WCAG
2.4.11 scroll-padding-top · password-recovery form contract (persistent
region, resend, transport failure surfaced) · protein-log silent success ·
password placeholder · legal wordmark alignment · dead trendToward/prev.

## Standing, owner's call

tile-lift-signature waiver re-flagged by the motion reviewer (hover lift
on 8 non-link sections). Copy proposals not applied: eyebrow badge is 60
chars and cannot be a badge at any width; negative-parallelism x6.
Byline "Alejandro" still unconfirmed — CRITICAL if the name is invented.

## Remaining tail

ledger Row in 4 ad-hoc shapes (needs a ui/ primitive) · 6 hardcoded
Spanish strings in auth · theme-toggle name/state contradiction · unread
badge unnamed for SR · no Cmd+Enter in composers · erase confirm text-sm
(iOS zoom) · landing skip link + empty first th · synthetic chip on 4 of
8 beats · 640KB unoptimized mannequin PNGs · React19 repro still pending.

---

# Iteration 4 attempt — 2026-08-12 (INVALIDATED, process gap)

Dispatched both reviewers against shots-auth/ (first authenticated
capture) expecting a real re-score. Both independently caught, by file
mtime, that the captures (14:28) predate the fixes they were meant to
verify (i18n key + chart + dashboard tile, committed 14:32-14:34) — the
capture happened, bugs were seen and fixed from the SAME batch, creds
were deleted, then the stale batch was re-used for scoring instead of
re-capturing. No new LEXIA SCORE published: scoring 3 of the evaluated
findings against known-fixed-but-unphotographed code would be evidence
theater, the exact thing the honesty rules exist to prevent.

Both reviewers surfaced independent, code-verifiable findings not tied
to the stale items:
- entreno/page.tsx: "today" card claimed a scheduled rest day even when
  no routine was ever published, contradicting the card below it. FIXED
  (commit 373cdb2) — hasRoutine now gates the rest-day copy.
- mi-espacio: PhotosCard stretched to match its taller sibling's grid-row
  height (CSS Grid default stretch, no items-start), leaving a mostly-
  empty bordered box for patients with few photos. FIXED (373cdb2) —
  wrapper takes self-start. medicacion's equivalent pairing already had
  items-start and needed no change.
- Patient list optimizes the "Peso" column for progress-to-goal, not
  recency/adherence — the brief's stated primary specialist task. NOT
  FIXED: product decision, flagged for the owner, not silently redesigned.
- Mobile patient table already scrolls (overflow-x-auto); lacks a visual
  cue that more columns exist off-screen. NOT FIXED: both reviewers rated
  it REVIEW-severity, out of scope without being asked.
- /panel/pacientes/[id] (patient detail) was never captured this round —
  two of three claimed signature touchpoints (bezel identity header,
  plans ledger) remain code-verified only.

Coverage note for the next real iteration 4: dark theme is completely
unverified for every authenticated surface; the detail page needs its
own capture; re-run shoot-auth.mjs fresh (new credentials, immediately
before dispatching reviewers, no gap for fixes to land in between).
