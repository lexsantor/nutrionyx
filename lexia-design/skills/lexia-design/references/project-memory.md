# Project Memory

The system cannot retrain itself; it learns operationally through
persistent, traceable files per project. All under `.lexia-design/` at the
project root. Create with:
`node ${CLAUDE_PLUGIN_ROOT}/scripts/lexia-design-score.mjs init`

## Layout

.lexia-design/
- DESIGN-BRIEF.md: the brief + dials + direction decision (template:
  templates/DESIGN-BRIEF.md). Written in step 3, updated only with the
  user's knowledge.
- DESIGN-SYSTEM.md: tokens, direction contract with breaks-if list,
  component inventory, external components registry. First written AFTER
  the first build validates (a rulebook written before the build gets
  defended against reality); maintained thereafter.
- DESIGN-AUDIT.md: latest audit report (template keeps history pointers).
- decisions.jsonl: one JSON object per decision. Schema:
  {"ts","type":"decision|exception|preference|rejection","area",
   "decision","context","alternatives":[],"outcome","evidence",
   "scope":"project|user|hypothesis","source":"user|audit|agent"}
- rejected-patterns.jsonl: patterns tried or considered and rejected,
  with reason: prevents re-proposing them.
  {"ts","pattern","reason","context","hard":true|false}
- evaluation-history.jsonl: appended by lexia-design-score.mjs; scores,
  gates, verdicts per iteration. Never hand-edit.
- project-preferences.json: thresholds and dial overrides, hook
  preferences, dependency budget. Read by scripts and skills.

## Read protocol (session start)

1. If .lexia-design/ exists: read DESIGN-BRIEF.md and DESIGN-SYSTEM.md
   fully; scan the last ~20 lines of each .jsonl; load
   project-preferences.json.
2. Honor prior decisions unless the user changes them; when a new request
   contradicts a recorded decision, surface the conflict in one sentence
   instead of silently switching.
3. rejected-patterns entries with "hard": true are never re-proposed;
   soft rejections may be revisited if context changed (say why).

## Write protocol

- Log decisions when made, not retroactively en masse.
- Classify scope honestly:
  - project preference: holds for this repo (e.g. "tables over cards").
  - user preference: the human stated it as general taste; still confirm
    before applying to a different project.
  - evaluation result: an audit/score fact with its evidence.
  - general rule: NEVER auto-promote; a single project's outcome does not
    create a universal rule. Propose promotion to the user explicitly if
    a pattern repeats across projects.
  - hypothesis: suspected but unverified; must carry what evidence would
    confirm or kill it.
- Before reusing a learning, check context comparability: surface type,
  audience, stack, dials. A dashboard lesson does not transfer to a
  campaign page by default.

## Hooks integration

The PostToolUse hook writes transient findings to
.lexia-design/last-audit.json (only when .lexia-design/ exists). The Stop
hook reads it to remind about unresolved criticals. Resolve or explicitly
waive findings (log the waiver as an exception in decisions.jsonl).
