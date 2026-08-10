# lexia-design

Design OS for Claude Code. One public entry point, `/lexia-design`, that
orchestrates visual direction, design systems, UX heuristics, WCAG 2.2
accessibility, anti-AI-slop auditing and functional motion into
production-ready frontend work.

Built as an original synthesis of studied sources (see `SOURCES.md` and
`sources.lock.json`); bundles no third-party code, datasets or components.

## What it optimizes for (in priority order)

1. User's objective  2. Clarity and usability  3. Accessibility
4. Content truthfulness  5. System coherence  6. Performance
7. Visual identity  8. Distinction from generic patterns
9. Motion and delight  10. Implementation convenience

One standing exception: an explicit user brief commitment ("the brief
wins") outranks the plugin's aesthetic preferences.

## Components

- Skills: `lexia-design` (orchestrator), `design-system`, `design-audit`,
  `motion-design`, `update`.
- Agents: `design-director`, `ux-auditor`, `visual-critic`,
  `motion-engineer` (fresh-context reviewers).
- Hooks: PostToolUse deterministic detector on UI file writes (advisory,
  never blocks); Stop reminder for unresolved critical findings.
- Scripts (`scripts/`, zero dependencies, Node >= 18):
  `lexia-design-audit.mjs` (30 file rules + 2 project rules),
  `lexia-design-score.mjs` (init / gate / history),
  `lexia-design-update.mjs` (source drift, metadata only).
- Knowledge (`references/`): heuristics, anti-slop registry, WCAG 2.2
  checklists, motion principles, GSAP playbook, 12 visual directions,
  component-library policy.
- Evals (`evals/`): 14 cases (12 positive, 2 negative) + offline smoke
  runner with a real detector self-test.

## Install

From a local clone:

```bash
git clone <this-repo> lexia-design
claude plugin validate ./lexia-design          # sanity check
```

Then inside Claude Code:

```
/plugin marketplace add ./lexia-design
/plugin install lexia-design@lexia
```

Or try it for a single session without installing:

```bash
claude --plugin-dir ./lexia-design
```

Reload after editing plugin files mid-session: `/reload-plugins`.
List installed: `claude plugin list`.
Uninstall: `claude plugin uninstall lexia-design` (and
`/plugin marketplace remove lexia` if desired).

## Use

```
/lexia-design build a landing page for <product>
/lexia-design improve the dashboard in ./app
/lexia-design:design-audit src/
/lexia-design:motion-design review the animations in src/components
/lexia-design:design-system
/lexia-design:update
```

The main skill also auto-activates on natural requests ("design a
pricing page", "audit this UI", "add scroll animations") and stays out
of backend/data/infra tasks.

Per-project memory lives in `.lexia-design/` (brief, system, audits,
decisions, evaluation history). Scaffold it manually with:

```bash
node <plugin-root>/scripts/lexia-design-audit.mjs --list-rules   # see detector rules
node <plugin-root>/scripts/lexia-design-score.mjs init           # scaffold .lexia-design/
```

## Detector quick reference

```bash
node scripts/lexia-design-audit.mjs src/components/Hero.tsx      # specific files
node scripts/lexia-design-audit.mjs --deep src --format json     # whole tree + project rules
```

Exit 1 = critical/serious findings. `confidence: "review"` findings are
heuristic signals that need human judgment; the detector never rewrites
code.

## Convergence gate

```bash
node scripts/lexia-design-score.mjs gate --scores scores.json
node scripts/lexia-design-score.mjs history
```

Defaults: MAX_ITERATIONS 4, MIN_TOTAL 8.5, MIN_DISTINCTIVENESS 7.5, zero
critical a11y/usability, zero regressions. Override per project in
`.lexia-design/project-preferences.json`.

## Evals

```bash
node evals/run-evals.mjs               # smoke: offline, validates cases + detector self-test
node evals/run-evals.mjs --live        # prints headless commands per case
LEXIA_EVALS_LIVE=1 node evals/run-evals.mjs --live --execute   # real runs, real API cost
```

## Hooks: behavior and off-switch

The PostToolUse hook audits only the file just written, only for UI
extensions, and reports findings as context; it always exits 0 and never
blocks. The Stop hook only reminds about unresolved critical/serious
detector findings recorded in `.lexia-design/last-audit.json` (and only
when a `.lexia-design/` directory exists).

Disable: per session `LEXIA_DESIGN_HOOKS=0`, or fully
`claude plugin disable lexia-design` (skills stay invocable after
re-enabling; disabling turns off the whole plugin).

## Updating knowledge sources

`/lexia-design:update` compares `sources.lock.json` against upstream
(metadata only), writes `UPDATE_PROPOSAL.md`, runs the smoke evals, and
waits for human approval. It never updates silently and never executes
remote code. Details: `docs/UPDATING.md`.

## External component libraries

Optional, policy-gated (`references/component-libraries/`): Skiper UI
(free tier requires attribution; premium paid) and Vengeance UI
(NO PUBLISHED LICENSE as of 2026-07-31: inspiration only). GSAP is fully
free since 3.13 and used only as generated `import`s, never bundled. The
plugin works completely without any of them.

## Repository layout

```
lexia-design/
├── .claude-plugin/{plugin.json, marketplace.json}
├── skills/{lexia-design,design-system,design-audit,motion-design,update}/
├── agents/{design-director,ux-auditor,visual-critic,motion-engineer}.md
├── hooks/hooks.json
├── scripts/{lexia-design-audit,lexia-design-score,lexia-design-update}.mjs
├── references/{heuristics,anti-slop,accessibility,motion,visual-directions,component-libraries}/
├── evals/{cases,expected,fixtures,run-evals.mjs}
├── templates/
├── docs/UPDATING.md
├── SOURCES.md · sources.lock.json · CHANGELOG.md · CONTRIBUTING.md · LIMITATIONS.md · LICENSE
```

## License

MIT (plugin code and text). Attribution and licensing of studied sources:
`SOURCES.md`. Known limitations: `LIMITATIONS.md`.
