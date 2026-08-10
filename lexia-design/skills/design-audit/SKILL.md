---
name: design-audit
description: >
  This skill should be used to audit an interface: "audit this UI",
  "review this design", "check accessibility", "find design problems",
  "why does this look AI-generated", "review UX of this page". Runs the
  deterministic detector plus fresh-context agent reviews, scores 15
  dimensions with evidence, and writes DESIGN-AUDIT.md. Also invoked by
  the lexia-design orchestrator during the convergence cycle.
argument-hint: "[path or scope]"
metadata:
  version: "0.1.0"
---

# Design Audit

Two independent tracks, never merged until synthesis: a deterministic
detector (no judgment) and agent judgment (fresh context). Detector
findings must not anchor the design judgment; run agents without showing
them the detector output.

## Procedure

1. Scope. Identify UI files (jsx/tsx/vue/svelte/html/css) and pages;
   read `.lexia-design/` for the brief, system contract and prior
   waivers. No brief? Audit against general rules and say the direction
   dimension is unanchored.
2. Deterministic pass:
   `node ${CLAUDE_PLUGIN_ROOT}/scripts/lexia-design-audit.mjs --deep <dir>
   --format json`. Rules with IDs (a11y/*, motion/*, slop/*, content/*,
   system/*); exit 1 means serious+ findings exist. Also run the
   project's own build/typecheck/lint/tests if present: a red build caps
   PRODUCTION_READINESS at 3.
3. Render pass. Screenshot key pages at 375/768/1440 (+ both themes).
   If rendering is impossible, mark visual dimensions "not visually
   verified": never score screenshots that don't exist.
4. Agent pass (parallel, fresh context, screenshots + brief as input):
   - ux-auditor: heuristics, accessibility, states, forms, content
     integrity.
   - visual-critic: hierarchy, typography, color, spacing, coherence,
     distinctiveness, anti-slop judgment calls.
   - motion-engineer: only if motion exists or was requested.
   Reviewers report their own verdicts; do not soften their wording in
   synthesis.
5. Checklist sweeps (self, using references under
   `${CLAUDE_PLUGIN_ROOT}/references/`): wcag-checklist.md gate items,
   forms-and-states.md seven states, anti-slop/registry.md two tests
   (interchangeability + reflex), responsive + content-length stress.
6. Synthesize. Merge tracks; deduplicate; classify severity: critical
   (blocks use / a11y gate / fabrication), serious (materially degrades),
   moderate, minor, review (needs human judgment). Distinguish error vs
   inconsistency vs debt vs preference vs deliberate exception (check
   decisions.jsonl waivers before flagging known exceptions).
7. Score 15 dimensions per
   `${CLAUDE_PLUGIN_ROOT}/skills/lexia-design/references/scoring.md`,
   evidence mandatory, n/a renormalized. Run
   `node ${CLAUDE_PLUGIN_ROOT}/scripts/lexia-design-score.mjs gate --scores
   <file>` to record history and get the verdict.
8. Report. Write `.lexia-design/DESIGN-AUDIT.md` from the template:
   scores table, findings grouped by severity with file:line + evidence +
   recommendation + status column, exceptions honored, verdict. In chat:
   top findings first, no padding.

## Audit dimensions (what to look at, minimum)

UX flows, accessibility, semantics, hierarchy, layout, typography,
color, states, responsive, content, performance, motion, AI-slop,
visual debt, system coherence. Selection guidance:
`${CLAUDE_PLUGIN_ROOT}/references/heuristics/application-map.md`.

## Discipline

- Report what is, not what would be comfortable. A clean audit of a
  broken interface is the worst outcome this skill can produce.
- False positives honestly: "review" severity means human judgment
  required; say so instead of inflating certainty.
- Do not fix during the audit. Findings first, fixes as a separate step
  (the orchestrator or the user decides what to act on).
