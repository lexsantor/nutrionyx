# Known Limitations

Honest inventory. Read before relying on the plugin in production work.

## Technical

1. Rendering depends on the environment. The convergence cycle needs a
   way to run and screenshot the project (dev server + Playwright or
   similar). Where nothing can render, the skill audits statically and
   marks visual dimensions "not visually verified"; it will not invent
   visual judgments. Screenshot tooling is NOT bundled.
2. The detector is regex-based, not an AST/DOM analysis. It trades depth
   for zero dependencies and speed. Consequences: some findings are
   heuristic (`confidence: "review"`), some real issues pass (contrast
   values, computed styles, runtime DOM), and clever formatting can evade
   rules. It is a tripwire, not a certifier.
3. Contrast is checked by process (measured pairs recorded in
   DESIGN-SYSTEM.md, agent verification), not computed by the scripts.
   Automated a11y tooling (axe etc.) is recommended on top and catches
   only ~30-40% of issues itself.
4. Score gates enforce arithmetic, not truth. Scores come from
   model/agent judgment; the gate prevents forgetting and drift, not
   dishonesty. The honesty rules in scoring.md are instructions, and a
   model can fail them.
5. Live evals require the claude CLI and consume real API credits;
   grading positive cases remains rubric-guided judgment, not exact
   string matching. Only the smoke suite is fully deterministic.
6. Convergence-breaking uses explicit candidate generation and declared
   anti-references instead of true randomness. Model self-randomization
   is documented as fake; an external entropy source was deliberately
   left out of scope.
7. Stop-hook reminders only work in projects with a `.lexia-design/`
   directory (by design: the plugin does not write state into arbitrary
   repos).
8. Model priors (cream, purple-gradient, etc.) are empirical and will
   drift with model generations; the update flow can retire them, but
   staleness between updates is real.

## Legal / licensing

9. Vengeance UI publishes no license (verified 2026-07-31): the plugin
   treats it as inspiration-only. If upstream adds a license, run
   /lexia-design:update to revisit.
10. Skiper UI's full Terms of Service were not retrievable (404) at
    verification time; the free-tier attribution requirement comes from
    their official docs. Users should re-verify before large commercial
    use.
11. GSAP's current license is Webflow's Standard "no charge" license:
    free including commercial use, but not OSI open source. The one
    relevant restriction (no no-code animation-builder competitors) does
    not affect code generation; re-check if you build GUI tooling on top.
12. Font recommendations name commercial faces as examples in places;
    shipping them requires the user's own licenses. Open alternatives
    are listed where relevant.

## Scope

13. Web surfaces only. Native iOS/Android get transferable principles at
    best; platform HIG/Material depth was deliberately excluded (and its
    upstream source not consumed, to avoid NOTICE propagation).
14. No Figma integration: the plugin designs in code. It can consume
    design context the user provides, but does not read design files
    itself.
15. The plugin cannot "train" or self-modify weights. Learning is
    operational (files in .lexia-design/) and its reuse rules are
    conservative by design: single-project outcomes never become
    universal rules automatically.
16. Localization guidance covers mechanics (Intl, expansion, RTL
    awareness) but the plugin does not translate content or validate
    locale-specific typography conventions in depth.
