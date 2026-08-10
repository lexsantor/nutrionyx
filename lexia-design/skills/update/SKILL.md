---
name: update
description: >
  This skill should be used when the user asks to update lexia-design's
  knowledge sources: "/lexia-design:update", "update lexia sources",
  "check for design source updates", "refresh lexia-design". Compares
  pinned sources against upstream, produces UPDATE_PROPOSAL.md, runs
  evals, and prepares a reversible change set. Never applies changes
  silently.
disable-model-invocation: false
metadata:
  version: "0.1.0"
---

# Update (controlled, traceable, reversible)

The plugin's knowledge is pinned in `sources.lock.json`. This flow
detects drift and PROPOSES changes; a human approves them. Hard
prohibitions: never update silently; never execute fetched remote code;
never overwrite manual rules or user decisions; never incorporate
material whose license changed to incompatible; never claim "updated"
without recording versions.

## Procedure

1. Read `${CLAUDE_PLUGIN_ROOT}/sources.lock.json`.
2. Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/lexia-design-update.mjs --check`:
   metadata-only queries (git ls-remote HEAD, npm view version); no
   downloads, no code execution. Offline/unreachable sources are marked
   as such, honestly.
3. For each drifted source, inspect what changed BEFORE proposing:
   clone/fetch to a scratch dir, read the diff of its content files and
   its LICENSE. License changed? Flag prominently; incompatible material
   is excluded regardless of usefulness.
4. Judge relevance: does the change affect principles this plugin
   synthesized (check SOURCES.md per-source "extracted" lists)? Version
   bumps with no principle impact are recorded, not acted on.
5. Write `UPDATE_PROPOSAL.md` (the script scaffolds it): per source:
   pinned vs latest, license status, summary of relevant changes,
   proposed edits to specific reference files, risk notes. Web-type
   sources (Skiper, Vengeance, standards) list their re-verification
   checklist instead of commits.
6. Regression check: run `node ${CLAUDE_PLUGIN_ROOT}/evals/run-evals.mjs
   --smoke`. If a proposed edit would change detector rules, run the
   fixtures and include before/after findings in the proposal.
7. Present the proposal and STOP. Apply only what the user approves,
   edit by edit; then update sources.lock.json (new commits/versions +
   checked date), append the change to CHANGELOG.md, and re-run the
   smoke evals. Every applied change must be revertible by git; commit
   before and after.

## Scope notes

- User project memory (.lexia-design/ in projects) is never touched by
  updates.
- Model-prior entries (references/anti-slop/model-priors.md) may be
  proposed for retirement when fresh audits stop finding them; that
  proposal follows this same flow.
- If upstream deleted or relicensed a repo, propose removing the
  attribution row only after removing every principle that requires it,
  or keep the historical attribution with an "archived" marker.
