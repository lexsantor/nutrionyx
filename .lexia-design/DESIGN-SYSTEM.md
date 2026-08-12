# DESIGN SYSTEM

Written from the built reality (19 slices, audits 2026-08-10/11/12), not
from intent. Every contrast value below is computed from the hex in
`src/app/globals.css`. Maintain incrementally; audits check the BREAKS IF
list.

## Direction contract

THESIS: a clinical record that reads like an instrument panel — arctic,
quiet, tabular. The product's job is to let a specialist read adherence
at a glance and a patient log their day in under a minute.

TENSION: clinical restraint vs. a landing that must sell. Resolved by
letting the landing dramatize the *same* record the product renders,
never by inventing marketing chrome the app does not have.

DIFFERENTIATOR: the annotated record — real product surfaces shown inside
double-bezel enclosures with numbered margin notes, instead of feature
cards describing them.

SIGNATURE MOVE: the double bezel (`src/components/ui/bezel.tsx`) — an
instrument plate in its tray: tinted outer shell + hairline + depth,
inner core with a top inner highlight, concentric radii (inner = outer −
padding). Present on the landing record beats, the patient-detail identity
header and the console dashboard's protagonist metric.

BREAKS IF:
1. Any accent token collapses into an ink token (light or dark). Accent
   must be distinguishable from `ink-subtle` at a glance; it carries
   links, hovers, selected states and the chart's primary series.
2. Semantic colors (`success`/`warning`/`error`) are used for data
   categories. They mean state, never category. Neutral data series use
   `surface-4`.
3. A bezel appears without concentric radii, or the signature is absent
   from the paid surfaces while the landing keeps it.
4. Text sits on a background pair below 4.5:1 (small text) or 3:1 (large
   text / UI borders). `ink-subtle` on `surface-3` is 4.39:1 — banned for
   text; use `ink-muted`.
5. Links or secondary actions gain underlines, or the primary action is
   not a filled pill with an outlined pill as its secondary.
6. Interaction colors run on the slow tier. Colors 200ms, transform and
   shadow 500ms, press 150ms, one curve (`--ease-house`).
7. Content widths multiply. One canonical container: `max-w-6xl`.
8. Any number a user compares to another number renders without
   `tabular-nums`.

NON-RESOURCES: no gamification (streak flames, confetti, badges), no
stock "diverse team" photography, no fabricated metrics/testimonials/
logos, no emoji as icons, no gradient text, no glassmorphism outside the
one fixed landing nav.

## Typography

Families: Syne Variable (display, self-hosted via @fontsource) + DM Sans
Variable (body/UI, self-hosted). Both OFL.

Scale in use: display 6xl (dashboard protagonist) · 5xl/4xl (landing H1)
· 3xl (stat numerals, page H1 on legal pages) · 2xl (page H1) · xl
(primary-task card heading) · lg (section heading) · base (sub-headings
inside grouped cards) · sm (body/UI) · xs (meta, chips).

Weights: 400 body, 500 medium (labels, meta), 600 semibold (headings,
buttons, numerals). No 700+.

Leading: 1.2 headings (globals base), 1.5 body, `leading-relaxed` for
long prose blocks.

Tracking: `tracking-tight` on display headings; `-0.2px`/`-0.4px` on
base h1–h4; `tracking-[0.18em]` uppercase only on the landing badge.

Measure limits: `max-w-[62ch]`/`[68ch]` prose, `max-w-[36ch]` margin
annotations, `max-w-[70ch]` legal documents.

Tabular numeral contexts (mandatory): weight/measurement values, stat
tiles, adherence ledger rows, dose history, chart headline, delta values,
progress percentages.

## Color

Fields/surfaces: `canvas` (page) → `surface-1` (cards) → `surface-2`
(inputs, zebra) → `surface-3` (chips, hover) → `surface-4` (neutral data
series, scrollbar). Hairlines: `hairline`, `hairline-strong` (hover).

Ink hierarchy: `ink` → `ink-muted` (secondary, and any small text on
surface-3) → `ink-subtle` (meta on surface-1/2 only).

Accent + lock rule: exactly one accent, `--c-primary` (light `#24405f`,
dark `#8dbde6`), plus `accent-text` for inline links. Semantic colors are
reserved for state. No second accent hue may enter the system.

Measured contrast (light):

| Pair | Ratio | Gate |
|---|---|---|
| ink / canvas | 18.02:1 | AAA |
| ink-muted / surface-1 | 10.91:1 | AAA |
| ink-subtle / surface-1 | 4.94:1 | AA |
| ink-subtle / surface-3 | 4.39:1 | FAIL — banned for text |
| on-primary / primary | 9.98:1 | AAA |
| primary / canvas | 9.98:1 | AAA |
| focus-ring / canvas | 4.63:1 | AA (needs ≥3:1) |
| success / success-soft | 4.61:1 | AA |
| warning / warning-soft | 5.24:1 | AA |
| error / error-soft | 5.20:1 | AA |
| field-border / surface-2 | 4.39:1 | AA (needs ≥3:1) |

Measured contrast (dark):

| Pair | Ratio | Gate |
|---|---|---|
| ink / canvas | 18.02:1 | AAA |
| ink-muted / surface-1 | 12.89:1 | AAA |
| ink-subtle / surface-1 | 8.16:1 | AAA |
| primary / canvas | 9.66:1 | AAA |
| primary / surface-1 | 8.80:1 | AAA |
| focus-ring / canvas | 8.95:1 | AAA |
| success / success-soft | 4.87:1 | AA |
| warning / warning-soft | 7.89:1 | AAA |
| error / error-soft | 5.29:1 | AA |
| field-border / surface-2 | 3.62:1 | pass (needs ≥3:1) |

## Space and layout

Rhythm: 4/8 scale only (`gap-1.5/2/3/4/5/6`, `p-4/5/6`, `py-10/16/20/24`).
Container: `max-w-6xl` on every surface (landing, patient, console,
admin, legal). Bento: 12 columns at `lg`, rows must sum to 12; when a
conditional partner is absent the survivor takes the row.

Elevation: `el-sm` (resting cards) → `el-md` (hover, floating nav) →
`el-lg` (landing CTA hover) → `el-bezel` (signature enclosure). One light
source, shadows tinted to the ink ramp (light) / canvas navy (dark);
never pure black.

## Components

Primitives (`src/components/ui/`): `Button` (primary/secondary/ghost/
destructive × default), `ButtonLink` (primary/secondary/ghost × lg/md/sm),
`Card` (static by default, `interactive` opts into the lift), `Input`,
`Bezel` (signature enclosure).

Shared surfaces: `Topbar` (patient/admin) with skip link, `ConsoleShell`
(specialist, persistent sidebar in the route-group layout), `WeightChart`
(SVG + sr-only data table), `BodyMapMeasures` (mannequin + zone bands),
`MessageThread` + `ScrollAnchor`, `UploadForm`, `Reveal` (landing only,
visible by default).

Form contract: every field labeled (visible or sr-only); pending label on
submit; `role="alert"` for errors; success in an always-mounted
`role="status"` region; identity fields carry `autocomplete`; destructive
actions are two-step (arm → confirm) or type-to-confirm; navigation away
from dirty editors is guarded.

## Motion

One curve: `--ease-house` = `cubic-bezier(0.32, 0.72, 0, 1)`, wired as
the Tailwind default so bare `transition-*` utilities inherit it.

Tiers: 200ms default (colors, borders, small hovers) · 500ms slow
(transform + shadow lifts, Reveal) · 700ms settle (bezel hover-in) ·
150ms press (`active:duration-150`).

Reduced motion: global block zeroes durations and delays and caps
`animation-iteration-count`; `Reveal` additionally guards in JS and
renders visible by default (SSR, no-JS and headless always see content).

Ambient exception: the landing teaser stack floats at 7–9s (waived,
`decisions.jsonl#hero-ambient-float`).

## Content

Language: Spanish only (`messages/es.json`); no hardcoded strings in
components except the two auth sign-in/up helper lines (known issue).
Register: plain, second person, sentence case, no exclamation marks, no
AI cliches. Synthetic landing data is chip-labeled. Legal copy is
provisional and labeled with version + date.
