# Execution Workflow

Bounded convergence cycle. Not an infinite loop: open-ended self-QA burns
the user's budget. Defaults (overridable in
.lexia-design/project-preferences.json):

MAX_ITERATIONS = 4
MIN_TOTAL_SCORE = 8.5
MIN_DISTINCTIVENESS_SCORE = 7.5
CRITICAL_ACCESSIBILITY_ISSUES = 0
CRITICAL_USABILITY_ISSUES = 0
VISUAL_REGRESSIONS = 0

## Cycle

1. INSPECT. Existing project: stack, conventions, shared components,
   current visual system, dependencies, run it if possible, capture the
   BEFORE state (screenshots). New project: confirm stack. Read
   .lexia-design/ if present (project-memory.md).
2. UNDERSTAND. Restate the problem in one sentence. Identify audience and
   primary task. At most ONE clarifying question, only if the reading
   genuinely forks; otherwise declare the interpretation and proceed.
3. DIRECTION. Surface type, dials, direction contract, anti-references,
   signature move (direction-protocol.md). Write DESIGN-BRIEF.md.
4. IMPLEMENT. Structure and content first; tokens and components next;
   states always; motion only after structure validates. Respect
   references/ rules and the project's conventions.
5. RUN. Start the dev server / build. A build that doesn't compile is
   iteration zero; fix before any visual judgment.
6. RENDER. Load the real pages at 375px, 768px, 1440px (+ ultra-wide for
   brand surfaces). Dark and light if both exist.
7. EVIDENCE. Screenshot each breakpoint/theme. Prefer Playwright if
   available in the environment; else any browser tooling available; if
   NOTHING can render, say so explicitly, run the static audit only, and
   mark all visual scores as "not visually verified": never invent visual
   judgments of unrendered UI.
8. AUDIT. Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/lexia-design-audit.mjs
   --deep <dir>` for deterministic findings. In parallel, dispatch
   fresh-context agents (ux-auditor, visual-critic, motion-engineer when
   motion exists) with the screenshots + brief. Fresh context is the
   point: reviewers must not inherit the builder's optimism.
9. PRIORITIZE. Merge findings; order by severity x user impact. Blockers:
   accessibility criticals, broken flows, content fabrications, build
   errors.
10. FIX. The top 3 highest-impact problems first. No cosmetic work while
    functional errors exist.
11. RE-RENDER. Same breakpoints, same pages.
12. COMPARE. Against the previous iteration: fixed? regressed? Run
    `node ${CLAUDE_PLUGIN_ROOT}/scripts/lexia-design-score.mjs gate` with the
    new scores; it appends history and returns a verdict. Revert any
    change that scored worse than what it replaced.
13. STOP when: all thresholds met; OR verdict says no measurable
    improvement over the previous iteration; OR MAX_ITERATIONS reached.
    Never continue chasing subjective perfection. On stop with unmet
    thresholds: report exactly what remains and why, honestly.

## Rendering strategy notes

- Screenshot loop only needs 1 batched round per iteration (all
  breakpoints in one pass), not per-tweak captures.
- Compare hero/first-viewport against the brief's stated composition
  before auditing deeper sections; every later section inherits the
  hero's shortfall.
- Test content variants during render: short, average, hostile-long
  strings on key components.

## Delivery

Final message includes: what was built, direction and why, dials, scores
table with evidence, remaining known issues, exceptions logged, and how
to run it. Update .lexia-design/ files (project-memory.md). Never declare
thresholds met without the score gate output.
