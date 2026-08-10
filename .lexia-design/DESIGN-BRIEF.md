# DESIGN BRIEF - Nutrionyx

## Product

PRODUCT: Multi-tenant clinical SaaS where nutritionists run their consulta
(assessment, diet/training/medication prescription, adherence, messaging,
agenda) and patients do a sub-minute daily check-in.
AUDIENCE: Spanish nutritionists (desk, clinical-SaaS culture: Healthie,
Nutrium) and their patients (mobile, consumer-health-app culture, ~25-65).
PRIMARY TASK: specialist - open a patient and read adherence at a glance;
patient - complete today's check-in in under a minute.
SURFACE TYPE: hybrid. Landing = brand; /mi-espacio, /panel, /admin, auth
= product.
CONTENT DENSITY: all content real (19 shipped slices); no brand
photography; the landing's sample record is labeled synthetic.

## Direction

BRAND ATTRIBUTES (translated):
- clinical calm = quiet surfaces, one primary accent, semantic color only
  for state
- rigor = hairlines, tabular figures, immutable histories rendered as logs
- Spanish closeness = tu-form copy, sentence case
- sober premium = double-bezel cards, diffused ambient shadows, 500ms
  cubic-bezier(0.32,0.72,0,1), zero overshoot

ANTI-REFERENCES: FitOdds dark-neon biohacker; SaaS-cream marketing gloss;
streak/confetti gamification; 3-equal-feature-cards landing; underlined
text links as secondary actions.

ACCESSIBILITY NEEDS: AA floor; patients skew older (clear labels, large
targets); global visible focus token; reduced-motion honored (Reveal is
visible-by-default; no motion gates content).

TECHNICAL CONSTRAINTS: Next 16 App Router, Tailwind 4, NORTE tokens in
globals.css, Syne/DM Sans self-hosted, es-only (next-intl), dark mode
first-class, no new dependencies.

## Dials

DESIGN_VARIANCE: landing 6 · app 4 (product cap respected)
MOTION_INTENSITY: landing 5 · app 3
VISUAL_DENSITY: landing 4 · app 6

## Signature move

"The annotated record": the product proves itself with its own surfaces -
the landing IS a synthetic patient record read the way a clinician reads
one; inside the app the same clinical-card language becomes the bento
tile with sub-degree physical hover.
