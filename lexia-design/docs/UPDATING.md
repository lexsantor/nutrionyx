# Updating lexia-design's knowledge

The plugin's rules synthesize external sources pinned in
`sources.lock.json`. Updates are controlled, traceable and reversible:
detection is automated; application is human-approved, always.

## The flow (/lexia-design:update)

1. `node scripts/lexia-design-update.mjs --check` queries metadata only:
   `git ls-remote <url> HEAD` for repos, `npm view <pkg> version` for
   packages. Web/spec sources (Skiper, Vengeance, WCAG, plugin docs) are
   flagged for manual re-verification when older than 90 days. Nothing
   is downloaded or executed.
2. For drifted sources, the update skill inspects upstream diffs in a
   scratch clone: LICENSE first, content second. A license change to an
   incompatible or absent license excludes the material regardless of
   value.
3. `UPDATE_PROPOSAL.md` records: pinned vs latest, license status,
   relevant changes, exact reference files proposed for editing, risks.
4. Regression safety: `node evals/run-evals.mjs --smoke` must pass
   before and after; detector-rule changes require fixture updates and a
   findings diff in the proposal.
5. Apply only after explicit approval, one source at a time, committing
   before and after; then update sources.lock.json (new pin + checked
   date) and CHANGELOG.md.

## Invariants (never violated by an update)

- No silent updates. No remote code execution. No overwriting of user
  decisions or project memory (`.lexia-design/` is never touched).
- Manual rules added by maintainers are not clobbered by source-driven
  edits; conflicts are surfaced in the proposal.
- "Updated" claims always carry recorded versions.

## Manual re-verification checklist (web sources)

- Skiper UI: pricing tiers, attribution wording, ToS availability.
- Vengeance UI: LICENSE file appearance (would upgrade it from
  inspiration-only), stack changes.
- GSAP: license URL content, current version, plugin list.
- WCAG/APG: new W3C Recommendation status, pattern count.
- Claude Code plugin docs: schema changes affecting plugin.json, hooks
  JSON protocol, skill frontmatter.

Record every re-verification date in sources.lock.json (`checked`).
