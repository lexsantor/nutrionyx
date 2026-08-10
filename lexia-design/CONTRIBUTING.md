# Contributing to lexia-design

## Principles for changes

1. Rules earn their place with evidence. A new anti-slop pattern or
   heuristic needs an observed failure (link, screenshot, audit finding),
   not taste alone. Record the motivation in CHANGELOG.md.
2. Binary and countable beats graded and vague. If a rule can be phrased
   as a threshold or a falsifier, phrase it that way; graded advice gets
   skimmed.
3. Defaults, not bans. Any pattern a legitimate brief could earn back is
   a default with a "justified when" clause, not an absolute.
4. No copied text. Principles from external sources are rewritten and
   attributed in SOURCES.md with license and version. Incompatible or
   unlicensed material stays out regardless of usefulness.
5. Progressive disclosure. SKILL.md bodies stay lean; depth goes to
   references/. If a SKILL.md grows past ~200 lines, move content.

## Workflow

1. Branch from main.
2. Make the change (skill, reference, rule, script).
3. Detector rule changes: add/extend a fixture in `evals/fixtures/` and
   its `manifest.json` expectations. A rule without a fixture is not
   done. Watch false positives: prefer `confidence: "review"` when
   detection is heuristic.
4. Run everything:

```bash
node --check scripts/*.mjs evals/run-evals.mjs
node evals/run-evals.mjs --smoke
claude plugin validate .
```

5. Update CHANGELOG.md (with motivation) and, if sources changed,
   SOURCES.md + sources.lock.json.
6. PR with: what changed, why (evidence), fixture proof, smoke output.

## Adding a knowledge source

Follow the update skill's rules even for manual additions: record URL,
license, exact commit/version, date checked, extracted principles and
exclusions in SOURCES.md; pin it in sources.lock.json; never bundle the
source's code or datasets.

## Style

- Markdown: short lines, dense, no filler; straight quotes; hyphens.
- Scripts: zero runtime dependencies, Node >= 18, every mode handles
  errors and exits with documented codes; hooks must always exit 0.
- English throughout the plugin; imperative voice in skill bodies.
