# SOURCES

Every external source studied while building lexia-design, with license, exact
version consulted, what was extracted, and what was deliberately excluded.

Method: principles were extracted, classified, deduplicated and rewritten as
original rules. No SKILL.md text, dataset, asset or component code was copied.
Where sources contradict each other, the resolution is recorded in
`references/` files and summarized here. Pinned versions live in
`sources.lock.json`; refresh them with `/lexia-design:update`.

---

## 1. Ilm-Alan/frontend-design

- URL: https://github.com/Ilm-Alan/frontend-design
- License: MIT (Copyright (c) 2025 Alan)
- Commit: `1641823c70438a5ca36e2a5ea43f6154e3e70b81` (2026-05-01)
- Extracted principles:
  - Visual directions as token-locked contracts: a direction is a commitment
    to concrete typography/color/geometry/texture decisions, not a mood word.
  - Falsifiable "breaks if" lists per direction, so fidelity is inspectable.
  - One direction per project; hybrid-by-accumulation treated as an error.
  - A mandatory, named differentiator per build, visible in the render.
  - Content discipline as a separate axis from visual fidelity; no fabricated
    telemetry, personas or build numbers; empty beats fake.
  - Unicode glyphs are not icons.
- Excluded / adapted:
  - Its closed 8-anchor taxonomy (replaced by an open 12-direction library
    with parameters instead of fixed hexes, plus a redesign path it lacks).
  - "Lean unexpected" as an absolute (subordinated to the user objective and
    surface type; an unexpected direction is a lever, not a law).
  - Its commercial font picks (kept only as examples with licensing notes).
- Reason for inclusion: the strongest formulation of direction-as-contract.

## 2. Leonxlnx/taste-skill

- URL: https://github.com/Leonxlnx/taste-skill
- License: MIT (Copyright (c) 2026 Leonxlnx)
- Commit: `e988add20dab0fa97d7a76781c48961c8184288e` (2026-07-23)
- Extracted principles:
  - Numeric design dials (variance, motion, density) as global constraints
    the rest of the rules reference by name.
  - Binary, mechanically checkable rules survive; graded advice gets skimmed.
  - Catalog of production-observed AI tells with concrete signatures
    (eyebrow density, section-number labels, fake version footers, div-built
    fake screenshots, one-accent lock, premium-consumer cream/brass ban).
  - Brief inference before code; at most one clarifying question.
  - Redesign protocol: classify preserve/overhaul/greenfield; never silently
    change slugs, nav labels, form names, logos or legal copy.
  - Motion must be motivated; scroll listeners banned in favor of
    IntersectionObserver / scroll-driven APIs; reduced-motion mandatory.
  - Changelog-driven hardening of rules from observed failures.
- Excluded / adapted:
  - All marketing/sponsor assets, logos and example screenshots (third-party
    brand material).
  - The "Taste Skill" name and branding.
  - Absolute bans that collide with legitimate briefs (em-dash-zero,
    serif bans) were converted to defaults with justified exceptions.
  - Its internal contradictions between sibling skills (v1 perpetual motion
    vs v2 motivated motion) resolved in favor of the newer, evidence-backed
    rules.
- Reason for inclusion: best source of countable anti-slop rules and dials.

## 3. pbakaus/impeccable

- URL: https://github.com/pbakaus/impeccable
- License: Apache-2.0 (Copyright 2025 Paul Bakaus). Its NOTICE.md covers
  iOS/Android references derived from ehmo's platform-design-skills; those
  files were NOT used here, so no NOTICE propagation applies.
- Commit: `32930818a109fafa87199babe92fa8e530cff5d3` (2026-07-30)
- Extracted principles:
  - Split judgment into a deterministic detector (no LLM) plus an isolated
    LLM critique; wire the detector into an edit-time hook.
  - "The brief wins": steering a clear brief toward the tool's taste is
    failure. Category defaults are "defaults, not bans" a brief can earn back.
  - Visitor modes (persuade / operate / read / experience) set the expression
    budget per surface, independent of the product.
  - Direction contract embedded in the artifact and audited at finish.
  - Bounded verification: batched render review, one fix batch, one
    confirmation round; open-ended self-QA burns the user's budget.
  - Fresh-context reviewer agents so the reviewer does not inherit the
    builder's optimism.
  - Persisted scores with trend lines; renormalize when criteria don't apply.
  - Per-model counter-priors (e.g. the cream/serif prior: treat the first
    palette that comes to mind as already spent).
  - Write the design-system doc from the built result, not before it.
- Excluded / adapted:
  - The "Impeccable" name and marks (Apache 2.0 grants no trademark rights),
    its kinpaku brand tokens, site/extension assets, demo projects.
  - Its external dice-roll randomization machinery (replaced by explicit
    anti-reference lists + variance dial; an in-model roll is not random and
    a localhost decision server is out of scope here; recorded as a known
    limitation).
  - Its 59 detector rules were not copied; lexia-design implements its own
    30-rule detector, original code and original rule set (overlap in what
    they detect is convergent, both describe the same public failure modes).
- Reason for inclusion: the most complete architecture for review loops.

## 4. emilkowalski/skills

- URL: https://github.com/emilkowalski/skills
- License: MIT (Copyright (c) 2026 Emil Kowalski)
- Commit: `70744e3816f1d93eafb697161a8b880a7384c5ff` (2026-07-27)
- Extracted principles:
  - Frequency gate: animation budget is inversely proportional to how often
    the user sees the element; keyboard-driven actions get none.
  - Fix hierarchy that starts with deletion, then reduction, then easing.
  - Duration bands per element type; UI ceiling ~300ms with justified
    exceptions; entrances slower than exits' perception needs; ease-out for
    UI, ease-in-out for on-screen movement, linear for constant motion;
    ease-in avoided on UI.
  - Nothing enters from scale(0); popovers scale from their trigger origin.
  - Springs for gesture-driven, interruptible motion; velocity handoff.
  - Interruptibility: transitions retarget, keyframes restart; never lock
    input during a transition.
  - Reduced motion means gentler, not zero.
  - Review skills separated by role: judge a diff vs audit-and-plan vs
    find opportunities (with a required "rejected candidates" section).
- Excluded / adapted:
  - The paid-course promotional first response mandated by his skill.
  - Apple WWDC quoted material inside his apple-design skill (Apple's
    expression; only paraphrased physics principles retained).
  - His exact velocity constants kept as attributed defaults, not laws.
- Reason for inclusion: highest-signal motion taste with concrete values.

## 5. vercel-labs/web-interface-guidelines

- URL: https://github.com/vercel-labs/web-interface-guidelines
- License: MIT (Copyright (c) 2025 Vercel Labs)
- Commit: `4e799d45c17aec1498c269287a83b9dba22b966b` (2026-04-06)
- Extracted principles: the audit backbone for interaction quality:
  keyboard operability and focus management, 24px desktop / 44px mobile
  targets, form rules (labels, paste, submit states, error placement),
  URL-as-state, real links, destructive-action protection, optimistic
  updates with rollback, empty/sparse/dense/error states, skeleton parity,
  aria-live for async status, compositor-only animation, content resilience
  (short/average/long), Intl formatting, safe areas, tabular numerals,
  explicit image dimensions, virtualization thresholds, dark-mode
  color-scheme, layered shadows, concentric radii.
- Excluded / adapted:
  - Its Vercel-brand copywriting rules (explicitly brand-specific upstream).
  - Its "prefer APCA over WCAG 2" stance inverted for EU compliance: WCAG
    2.2 AA is the gate; APCA is an advisory second opinion (APCA is not in
    the WCAG 3 draft as of 2026-03).
- Reason for inclusion: widest, most concrete interaction/a11y rule surface.

## 6. nextlevelbuilder/ui-ux-pro-max-skill

- URL: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- License: MIT (Copyright (c) 2024 Next Level Builder); repo is the free tier
  of a commercial product (uupm.cc).
- Commit: `ec1f2a9027e270c9a4e8e3dbc243136fa9d32505` (2026-07-31)
- Extracted principles:
  - Product type constrains style: encode what each direction must NOT be
    used for (e.g. soft 3D relief surfaces excluded from data-heavy or
    accessibility-critical products).
  - Industry-specific anti-patterns as first-class data.
  - Design-system-first: generate the system before component code; persist
    a master file with page-level overrides for cross-session consistency.
  - Data/engine/prose separation keeps prompts small and rules updatable.
  - Coherence resolution so recommendations don't contradict each other
    (e.g. dark-mode intent vs light palette).
- Excluded / adapted:
  - All CSV datasets (styles, 192 palettes, fonts, reasoning rules): legally
    reusable under MIT but editorially theirs and error-prone; regenerated
    nothing from them.
  - Its premium-tier descriptions, brand names, install CLI.
  - Its severity model (149/161 rules "HIGH" carries no signal) and its 1:1
    product-to-palette determinism (replaced by direction frameworks).
- Reason for inclusion: the product-type decision layer and persistence
  architecture; also a cautionary example of breadth over depth.

## 7. GSAP (greensock/GSAP + gsap.com)

- URL: https://github.com/greensock/GSAP / https://gsap.com
- Version: gsap 3.15.0 (npm), @gsap/react 2.1.2. Verified 2026-07-31.
- License: Standard "no charge" GSAP License, granted by Webflow, effective
  2025-04-30 (https://gsap.com/community/standard-license/). 100% free
  including all formerly-Club plugins since 3.13.0. Proprietary but free;
  commercial use allowed. Restriction: may not be used to build no-code
  visual animation builders competing with Webflow. Note: the legacy URL
  gsap.com/standard-license intermittently serves the pre-2025 text; the
  /community/standard-license/ page is the current authority.
- Extracted: plugin map, useGSAP cleanup pattern, gsap.matchMedia with a
  reduced-motion condition, ScrollTrigger pitfalls, performance rules.
- Excluded: no GSAP source is bundled; the plugin only generates code that
  imports gsap from npm.

## 8. Vengeance UI

- URL: https://www.vengenceui.com/ (repo: github.com/Ashutoshx7/VengenceUI)
- Verified 2026-07-31: React + TypeScript + Tailwind + Framer Motion,
  46 components, free, solo maintainer.
- License: NONE PUBLISHED. LICENSE file absent; terms defer to a repository
  license that does not exist. Default: all rights reserved.
- Decision: classified as inspiration-only. The component-libraries policy
  forbids recommending copy-paste of its code until a license is published,
  and requires labeling it "no published license - verify before commercial
  use".

## 9. Skiper UI

- URL: https://skiper-ui.com/
- Verified 2026-07-31: Next.js + Tailwind + shadcn/ui conventions, Motion
  and GSAP based, 106+ components, shadcn CLI registry (@skiper-ui).
- License: free tier allows personal and commercial use WITH required
  attribution; Premium $129 / Exclusive $549 one-time remove attribution.
  Full ToS not publicly retrievable (terms page 404) - recorded as a gap.
- Decision: usable with two mandatory disclosures (attribution on free tier;
  never share or bypass license keys). Its own docs state most components
  are recreations of other products' UI - flagged so users don't clone a
  recognizable third-party interface wholesale.

## 10. Standards and platform documentation

- WCAG 2.2, W3C Recommendation (revision 2024-12-12):
  https://www.w3.org/TR/WCAG22/ - conformance floor. Verified corrections
  encoded: 3.3.3 is AA (not A); 2.3.3 Animation from Interactions is AAA
  (best practice, not gate); 2.5.8 Target Size 24px with its five
  exceptions; 4.1.1 removed in 2.2.
- WAI-ARIA APG: https://www.w3.org/WAI/ARIA/apg/ - 30 patterns (verified
  count), "no ARIA is better than bad ARIA".
- WCAG 3.0: Working Draft (2026-03-03), not citable as standard; APCA was
  removed from the draft in 2023 - treated as advisory tooling only.
- Claude Code plugin/skill/hook/agent schemas:
  https://code.claude.com/docs/en/plugins-reference (verified against CLI
  2.1.220): plugin.json fields, marketplace source "./", skill frontmatter,
  /plugin:skill namespacing, hooks JSON protocol, ${CLAUDE_PLUGIN_ROOT},
  bin/ on PATH, ${CLAUDE_PLUGIN_DATA}.

---

## Cross-source conflicts and resolutions

1. Exit easing: Emil (ease-out for exits) vs Material-derived convention
   (ease-in for exits). Resolution: ease-out both ways as default for UI
   surfaces; ease-in on exit allowed only for elements leaving under their
   own momentum. Recorded in references/motion/principles.md.
2. Minimal motion vs choreography: Emil/Vercel restraint is the default
   register for product surfaces; heavy GSAP choreography is an opt-in
   register for brand surfaces, controlled by the MOTION_INTENSITY dial.
3. Contrast standard: WCAG 2.2 AA is the gate (EU compliance); APCA is
   advisory. Vercel's preference inverted, with reasons.
4. Eyebrows/kickers: mandated by one source, rationed by another, banned by
   two. Resolution: default-avoid, quota when used (<= 1 per 3 sections),
   justified exceptions logged. "Defaults, not bans" framing wins.
5. Pure black / centered heroes / bold patterns: never globally banned;
   directions that genuinely require them earn them back via the direction
   contract. Reflex is the failure mode, not the pattern.
6. Randomness vs inference for direction choice: external dice (impeccable)
   not adopted; lexia-design uses explicit candidate directions + declared
   anti-references + the DESIGN_VARIANCE dial, and records that model
   self-randomization is not random.
7. Placeholders: empty-but-labeled beats fake. Seeded stock photography is
   acceptable only when explicitly marked as placeholder art direction.

## What this plugin deliberately does NOT copy

- No SKILL.md prose from any source.
- No detector rule code from impeccable (original 30-rule implementation).
- No CSV datasets from ui-ux-pro-max.
- No component code from Vengeance UI (unlicensed) or Skiper UI (partly paid).
- No GSAP source. No fonts. No brand assets, logos, screenshots or names.
- No Apple WWDC quoted expression.
