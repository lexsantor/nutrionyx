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
