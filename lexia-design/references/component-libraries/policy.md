# External Component Policy

External component libraries (Vengeance UI, Skiper UI, shadcn ecosystem
registries, and any future addition) are optional tools, never the
automatic base of a project. An interface is not a collage of demo
components.

## Vetting checklist (all 10 before installing anything)

1. Stack compatibility: the component's framework, styling system and
   animation runtime match the project (React version, Tailwind version,
   Motion vs GSAP). If not: do NOT port blindly; extract the conceptual
   pattern and implement it natively (see below).
2. License and access: verify the license TODAY (catalog.md records the
   last verified state; licenses change). No license file = all rights
   reserved = inspiration only.
3. Tier: free vs premium. Premium components require a valid license key
   owned by the user. Never bypass, share, or reconstruct premium code
   from screenshots/videos.
4. Dependencies: list what it drags in (gsap? framer-motion? lucide?).
   Each new transitive runtime must pass the project's dependency budget.
5. Accessibility: audit against the relevant APG pattern BEFORE adoption:
   keyboard contract, focus management, names, contrast in both themes.
   Marketing claims are not audits. Decorative components with no a11y
   posture (common in flair libraries) must degrade to accessible
   fallbacks.
6. Bundle weight: measure the real import cost; a hero effect that costs
   180KB of JS needs extraordinary justification.
7. Responsive behavior: test 360px, tablet, ultra-wide, and with real
   content lengths, not the demo's curated strings.
8. Reduced motion: verify prefers-reduced-motion handling exists; if
   absent, wrap it yourself before shipping or reject.
9. Real need: name the function it serves (which brief requirement, which
   section). "It looks spectacular" is not a function.
10. System adaptation: retokenize to the project's design system (colors,
    radii, type, spacing, easing tokens). A component that keeps its
    origin styling is a foreign object.

## Registration (mandatory)

Every adopted external component gets an entry in the project's
DESIGN-SYSTEM.md under External Components: origin + version/date,
license/tier, dependencies added, modifications made, why chosen,
rejected alternative, accessibility notes, performance notes. Unregistered
external components are audit findings.

## Pattern extraction (stack-mismatch path)

When the library's stack doesn't match: study the interaction concept
(what states, what physics, what hierarchy), then implement it against
the project's own stack and tokens following references/motion/ and
accessibility/ rules. The result is original code inspired by a pattern:
note the inspiration in DESIGN-DECISIONS for honesty; patterns are not
copyrightable, code is.

## Quantity discipline

More than 2-3 showcase-grade external components per surface reads as a
template. Flair components concentrate where attention should peak (one
hero moment, one signature interaction); the rest of the interface is
system-built. If the design only works because of borrowed spectacle,
the structure has failed (registry.md: spectacle-vs-structure).
