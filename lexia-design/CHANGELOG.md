# Changelog

All notable changes to lexia-design. Format: Keep a Changelog; versioning:
semver. Rule changes should cite the observed failure or source update that
motivated them (changelog-driven hardening).

## [0.1.1] - 2026-07-31

### Changed

- Renamed `bin/` to `scripts/`. Motivation (observed failure): claude.ai-
  hosted plugin validation rejects top-level `bin/` because it is added to
  PATH on the CLI without appearing on the admin approval surface. All
  entry points were already invoked via explicit
  `${CLAUDE_PLUGIN_ROOT}/scripts/...` paths in hooks and skills, so no
  functionality changed; PATH exposure was never relied upon.

## [0.1.0] - 2026-07-31

Initial release.

### Added

- Orchestrator skill `/lexia-design` with bounded convergence cycle
  (4 iterations, scored gates) and priority order.
- Skills: design-system, design-audit, motion-design, update.
- Fresh-context reviewer agents: design-director, ux-auditor,
  visual-critic, motion-engineer.
- Deterministic detector (30 file rules + 2 project rules) wired to a
  PostToolUse hook (advisory) and a Stop reminder hook; disable with
  LEXIA_DESIGN_HOOKS=0.
- Scoring gate with per-project thresholds and evaluation history.
- Source drift checker (metadata only) + UPDATE_PROPOSAL scaffold.
- Knowledge references: UX heuristics catalog and application map;
  anti-slop registry, copy rules and model priors; WCAG 2.2 checklists
  (verified 2026-07-31, incl. 3.3.3=AA and 2.3.3=AAA corrections), focus/
  keyboard and forms/states guides; motion principles, tech ladder and
  GSAP 3.15 playbook; 12 visual directions + direction protocol;
  component-library policy and verified catalog (Skiper UI, Vengeance UI).
- Evals: 14 cases (12 positive, 2 negative), grading rubrics, fixtures
  with a detector self-test, offline smoke runner, gated live mode.
- Templates for DESIGN-BRIEF, DESIGN-SYSTEM, DESIGN-AUDIT, decisions
  JSONL and project preferences.
- SOURCES.md attributions and sources.lock.json pins for all 13 sources.
