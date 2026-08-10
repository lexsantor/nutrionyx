# Anti-Slop Registry

Catalog of patterns that read as generic AI output. Framing rule, adopted
after comparing conflicting upstream philosophies: these are DEFAULTS, NOT
BANS. A pattern is slop when it appears by reflex; the same pattern chosen
deliberately, justified by content, product and identity, and recorded in the
direction contract, is a decision. The reflex is the failure mode.

Severity meaning:
- block: fix before delivering (also enforced by the detector where marked).
- flag: needs an explicit justification in DESIGN-DECISIONS to survive.
- review: heuristic detection; human/agent judgment required.

Rule IDs in brackets map to `scripts/lexia-design-audit.mjs` where detection is
deterministic. Patterns without an ID are judgment calls for the
visual-critic agent.

## Color and surface

- Purple-blue gradient as default direction [slop/purple-gradient, flag].
  Justified when: the brand is genuinely purple/blue. Detection: violet-to-
  blue/cyan/pink gradient classes or hex pairs.
- Cream/warm-paper + serif + brass for every artisan/premium/wellness brief
  (flag). The single most cross-validated model prior. Treat the first
  palette that comes to mind as already spent; see model-priors.md.
- Black background + neon glows for every tech product (flag). Justified
  when: the direction contract commits to it and content supports it.
- Glassmorphism applied indiscriminately (flag). Justified when: layered
  chrome over rich content where translucency communicates depth; never
  stack two light translucent surfaces.
- Blurred decorative orbs / radial halos (flag). Almost never structural.
- Soft, uniform, offsetless shadows everywhere (review). Shadows need an
  offset plus blur consistent with one light source; a zero-offset halo is
  decoration.

## Typography

- Inter/system font used without intention (review). System stacks are a
  legitimate choice for product surfaces; as a display face on a brand
  surface it usually means the search stopped early.
- Reflex display serif on "creative" briefs; Fraunces-class faces as
  default (flag). Rotate; a serif must beat a sans for THIS content.
- Oversized hero display with flat hierarchy below (review).
- Fake typographic sophistication: letter-spaced all-caps micro-labels
  everywhere. See eyebrow rule below.

## Layout and structure

- Centered hero: generic headline + subtext + two buttons (flag). Justified
  when: manifesto-style brand statement, and then executed with craft.
- Three identical icon+title+text feature cards (flag). Vary structure by
  content; a bento grid must have exactly as many cells as real items
  [related: slop/card-density].
- Bento grid unrelated to content (flag). Bento is for genuinely
  heterogeneous content with real hierarchy.
- Cards inside cards [slop/card-density, review]. Enclosure is expensive;
  prefer whitespace and alignment. Detection: high density of
  rounded+shadow/border elements.
- Excessive rounded corners as personality substitute (review). Radius is a
  system token, concentric (child <= parent), not a mood.
- Icons in rounded squares above every heading (flag).
- Section-number labels (01 / INDEX) and version chips (BETA v0.6) as
  decoration (flag).
- Eyebrow/kicker micro-labels: quota <= 1 per 3 sections
  [slop/eyebrow-density, review]. Upstream sources disagree (mandate/ration/
  ban); the ration position wins, with logged exceptions.
- Interchangeable sections: if a section could ship on a competitor's site
  unchanged, it carries no identity (review; the interchangeability test is
  part of the visual-critic rubric).

## Motion and effects

- Entrance animation on every element [motion checks, flag]. One authored
  focal moment beats ubiquitous fade-ups. See references/motion/.
- Scroll hijacking [motion/scroll-hijack-lib, review]. Native scroll is a
  user's instrument; smoothing libraries only with strong narrative reason,
  reduced-motion fallback, and interruptibility.
- Custom cursors that impair interaction (flag). Cursor changes only when
  they add signification, never global novelty cursors on product surfaces.
- Effects copied from award sites without relation to the brand (review).
  Extract the principle, not the effect.
- Spectacular components substituting for structure (review). If removing
  the effect collapses the section's meaning, there was no section.

## Content (see copy-rules.md for the full policy)

- Fabricated metrics, testimonials, logos, activity [content/fabricated-
  metrics, content/fake-testimonial, block until verified or labeled].
- Fake technical labels: pseudo-terminal chrome, invented build hashes,
  decorative status dots (flag).
- Overfamiliar microcopy on serious products (review). Match register to
  the surface: a bank error is not "Oopsie!".
- Generic value-prop copy: "Revolutionize your workflow" class
  [content/buzzword-copy, flag]. Claims need evidence; adjectives are not
  evidence.
- Decorative illustrations with no communicative function (review).
- Emoji as interface icons [slop/emoji-icon, block]. Unicode glyphs as
  improvised icons [slop/unicode-pseudo-icon, flag]. One real icon set, one
  stroke width, or nothing.

## The two tests every delivery must pass

1. Interchangeability test: cover the logo. Could this ship for any company
   in the category? If yes, distinctiveness failed (score it honestly in
   DISTINCTIVENESS).
2. Reflex test: for each flagged pattern present, is there a written
   justification tied to content or brand? Unjustified flagged patterns are
   findings, not style.
