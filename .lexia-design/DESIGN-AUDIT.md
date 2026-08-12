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
