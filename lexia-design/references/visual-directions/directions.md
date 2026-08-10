# Visual Direction Library

Twelve direction territories. A direction is a contract: concrete,
falsifiable commitments about typography, color logic, geometry, texture,
imagery and motion. Not moods. Pick ONE dominant direction per project, add
one deliberate tension, one visible differentiator, and an explicit
anti-reference list (see direction-protocol.md). Color entries are
generative rules, not fixed palettes: derive actual values from the brand
and verify contrast.

Every direction lists "breaks if" falsifiers: if a delivered screen
violates them, the direction did not hold, whatever the intention was.

## 1. Swiss / International Modern

- Essence: objective clarity; the grid is visible in the result.
- Type: one neo-grotesque family (e.g. Neue Haas class; open alternatives:
  Inter Tight, Archivo, Hanken Grotesk used with intention), tight display
  tracking, flush-left ragged-right, size contrast >= 3x between display
  and body. Numerals as compositional material (dates, folios).
- Color: paper white or near-black field, one saturated accent used
  structurally (never decoratively), grays derived from the field hue.
- Geometry/space: hard modular grid, 0-2px radii, hairline rules, asymmetric
  layouts with deliberate empty columns.
- Texture/imagery: none, or documentary photography full-bleed.
- Motion: minimal, precise; opacity/position micro-shifts; MOTION 2-4.
- Best for: institutions, architecture, engineering brands, portfolios,
  editorial products.
- Breaks if: warm paper tint, decorative serif, centered hero stack,
  soft shadows, rounded cards, more than one accent.
- Slop risk: low; risk is sterility. The differentiator must carry warmth.

## 2. Editorial Print

- Essence: a well-set magazine translated to the web; reading is the
  product.
- Type: serif for text (real text serif, not display-only), grotesque for
  chrome/captions; strict typographic scale; drop caps/margin notes as
  optional signature; measure 65-75ch enforced.
- Color: ink on paper (either polarity), one editorial accent (rubric red
  class), duotone imagery allowed.
- Geometry/space: multi-column grids that collapse honestly; horizontal
  rules; folio/byline conventions used truthfully.
- Texture/imagery: photography with real captions; pull quotes set large.
- Motion: none-to-subtle; reading position is sacred; MOTION 1-3.
- Best for: publications, essays, research products, long-form marketing.
- Breaks if: serif used only in the hero, fake bylines/dates, decorative
  pull quotes with no source, walls of centered text.
- Slop risk: medium: the model's "editorial" reflex is Fraunces + cream;
  see model-priors.md. Choose the serif against that prior.

## 3. Brutalist Web

- Essence: raw structure exposed; honesty as aesthetic; energy over polish.
- Type: system stack or one aggressive grotesque at extreme sizes; visible
  link underlines; default-blue links are a legitimate move here.
- Color: pure black/white plus at most two loud primaries; no gradients.
- Geometry/space: hard edges, 0 radius, visible borders (2px+), table-like
  layouts, deliberate density jumps.
- Texture/imagery: none, or aggressively unretouched.
- Motion: instant state changes; hover inversions; marquee allowed (one,
  pausable); MOTION 1-3 or a single loud move.
- Best for: studios, events, zines, developer tools with attitude,
  anti-corporate brands.
- Breaks if: soft shadows, rounded corners, pastel accents, "brutalism"
  reduced to a Courier heading on a normal SaaS layout.
- Slop risk: medium: brutalism-as-costume is common; the structure itself
  must be raw, not just the font.

## 4. Industrial Mono

- Essence: instrument panel; every pixel reports something.
- Type: one monospace family for data + one compact grotesque for prose;
  tabular numerals mandatory; uppercase labels with wide tracking used
  sparingly and truthfully.
- Color: dark or light neutral field, functional colors only (status
  semantics), one instrument accent.
- Geometry/space: dense grid, hairline dividers, square terminals, aligned
  decimal points; zero decorative enclosure.
- Texture/imagery: none. Charts are the imagery.
- Motion: value transitions (number ticks, chart updates) only; MOTION 1-2.
- Best for: monitoring, infra tools, trading, logistics, dev tools.
- Breaks if: fake telemetry, decorative status dots, glow effects,
  monospace used as costume on marketing prose.
- Slop risk: high if faked: this direction is earned by real data density.

## 5. Soft Modern Product

- Essence: calm, legible, friendly default for mainstream SaaS; the
  category standard executed at full craft.
- Type: humanist grotesque (e.g. Hanken, Figtree class), moderate scale,
  weight-driven hierarchy.
- Color: light neutral field, one brand accent + full semantic set, hue-
  tinted grays (never pure gray on color).
- Geometry/space: 8px rhythm, radius tokens 6-12px concentric, layered
  two-part shadows, restrained enclosure (whitespace before boxes).
- Texture/imagery: real product screenshots, simple spot illustration only
  if the brand owns an illustration system.
- Motion: standard register (150-300ms, ease-out), MOTION 3-5.
- Best for: horizontal SaaS, admin tools, settings-heavy products, the
  "standing exit" when the user wants convention.
- Breaks if: three identical feature cards, glassmorphism, purple-blue
  gradient, icon-in-rounded-square headers, testimonial walls.
- Slop risk: maximum: this is the model's home register. It survives only
  through craft: typography precision, real content, perfect states.

## 6. Luxe Restraint

- Essence: expense expressed through omission; whitespace is the luxury.
- Type: one fine serif OR one thin grotesque at large sizes, wide
  tracking on small caps labels, tiny body sizes with generous leading.
- Color: near-monochrome; accent is often none (a photograph carries all
  color); metallics only as photography, never as CSS gradients.
- Geometry/space: vast margins, few elements per viewport, centered
  compositions allowed (this direction earns them), full-bleed photography.
- Texture/imagery: photography IS the interface; art direction dominates.
- Motion: slow, few, precise (400-700ms), crossfades, subtle parallax
  earned; MOTION 3-5.
- Best for: fashion, jewelry, hospitality, architecture, premium goods.
- Breaks if: dense sections, badges/pills, bright semantic colors in
  chrome, stock photography, discount-store urgency patterns.
- Slop risk: medium: fake luxe = thin font + black bg + gold hex #d4af37.
  Real luxe requires photographic assets; without them, decline the
  direction.

## 7. Warm Analog

- Essence: print artifacts and physical material, chosen deliberately (this
  is the model's cream prior made conscious; enter only past the
  model-priors checkpoint).
- Type: slab or old-style serif + grotesque support; ink-trap character
  faces allowed; no Fraunces-by-default (pick against the prior).
- Color: paper tints WITH pigment saturation (avoid the dead cream range),
  earth pigments, one print accent (risograph blue/red class).
- Geometry/space: visible baseline rhythm, borders like print rules,
  stamps/seals as signature move if brand-true.
- Texture/imagery: grain 1-3% via SVG turbulence on fixed non-interactive
  layers; paper edges; analog photography.
- Motion: minimal; page-turn metaphors forbidden; MOTION 1-3.
- Best for: coffee/food craft, bookshops, letterpress studios, festivals.
- Breaks if: it converges on beige + Fraunces + brass (the spent palette),
  texture on interactive elements, grain above 3%.
- Slop risk: maximum by prior; require the alternative exploration rule.

## 8. Chromatic Pop

- Essence: flat, saturated color blocks doing the structural work.
- Type: one heavy geometric grotesque, tight leading, display sizes brave.
- Color: 3-5 saturated flats with system logic (block = section semantics),
  black outlines optional; contrast verified per pair (saturated pairs
  fail often).
- Geometry/space: color-block regions instead of cards; oversized UI
  elements; sticker/badge geometry as signature.
- Texture/imagery: flat illustration or cutout photography.
- Motion: springy but few (translation/scale pops); MOTION 4-6.
- Best for: consumer apps, events, education, food delivery, youth brands.
- Breaks if: color applied as accents on white instead of committed
  regions, or palette drifts per section (accent lock applies).
- Slop risk: low-medium; the risk is Memphis confetti with no system.

## 9. Terminal Utility Dense

- Essence: maximum information per pixel for expert daily users; speed is
  the aesthetic.
- Type: 13-14px UI grotesque or mono, weight-only hierarchy, tabular nums.
- Color: one calm field, semantic colors strictly reserved for state,
  focus/selection highly visible.
- Geometry/space: 4px rhythm, dividers over cards, inline editing, zero
  decorative padding; keyboard-first affordances visible.
- Texture/imagery: none.
- Motion: none except state confirmation; MOTION 1; instant everything.
- Best for: internal tools, admin consoles, ops, power-user B2B.
- Breaks if: marketing components leak in, decorative empty states, any
  animation on the hot path.
- Slop risk: low; risk is illegibility: density without hierarchy.

## 10. Organic Naturalist

- Essence: living-world reference: earth palette, asymmetry, matter.
- Type: humanist serif or grotesque with calligraphic warmth; nothing
  geometric-cold.
- Color: sage/clay/terracotta/moss families (NOT cream-beige default),
  daylight neutrals derived from the palette.
- Geometry/space: soft but irregular radii (blob geometry only as a
  controlled signature, never scattered), organic section dividers earned
  by brand, generous air.
- Texture/imagery: real nature/product photography with consistent grade.
- Motion: slow ease-in-out drifts, growth metaphors; MOTION 3-5.
- Best for: wellness (evidence-based), food origin, sustainability,
  gardening, skincare with real credentials.
- Breaks if: pseudo-medical claims (content integrity), blob-confetti,
  leaf clip-art, cream drift.
- Slop risk: high: "wellness aesthetic" is a strong prior; differentiate
  via photography and structure, not palette alone.

## 11. Retro-Futurist

- Essence: a PAST era's vision of the future, executed with period
  discipline (pick the era: 70s NASA, 80s chrome, 90s cyber, Y2K gloss).
- Type: era-true faces (extended grotesques for NASA-70s; chrome scripts
  only as images for 80s), modern body face for actual reading.
- Color: era palette with one modern neutral base to keep UI legible.
- Geometry/space: era geometry (racing stripes, starbursts, bevels) as
  STRUCTURE for a few key moments, not wallpaper.
- Texture/imagery: period print/screen artifacts (halftone, scanline)
  at low intensity on non-interactive layers.
- Motion: era-coherent (CRT flicker once, not looping; chrome shine on
  key CTA only); MOTION 3-6.
- Best for: games, music, events, fashion capsules, products with a real
  nostalgia thesis.
- Breaks if: eras mix, effects loop forever, body text legibility pays for
  the theme, or "retro" = purple grid + neon sun template.
- Slop risk: maximum: the synthwave template is a documented cliche;
  require an era argument and an anti-template differentiator.

## 12. Playful Geometric

- Essence: primary shapes as interface language; toy-like clarity.
- Type: rounded geometric grotesque, large sizes, short lines.
- Color: 2-4 bright flats + generous white, shape = meaning consistency
  (circle/triangle/square carry semantics).
- Geometry/space: big radii ON A TOKEN SYSTEM, chunky borders, oversized
  controls (touch-target paradise), shape-based iconography.
- Texture/imagery: flat shapes, no gradients, no shadows or one hard
  offset shadow style.
- Motion: bouncy allowed HERE (spring overshoot 0.2-0.3), short, on
  interaction only; MOTION 4-6.
- Best for: kids/education, creative tools, community products,
  onboarding-heavy consumer apps.
- Breaks if: bounce leaks into destructive/serious flows, shapes carry no
  consistent meaning, radii vary randomly.
- Slop risk: low-medium; risk is condescension in copy (register rules).

## Choosing

Score candidates against: audience culture fit, content availability
(photography? data? illustration?), surface type, DESIGN_VARIANCE dial,
accessibility needs, and the anti-reference list. The model-priors
checkpoint applies before confirming directions 5, 7, 10, 11. Document the
choice as a direction contract (direction-protocol.md).
