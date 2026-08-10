# Component Library Catalog

Verified facts as of 2026-07-31 (refresh with /lexia-design:update; treat
older than ~90 days as stale for licensing decisions).

## Skiper UI (https://skiper-ui.com/)

- What: 106+ design-forward, animation-heavy components on shadcn/ui
  conventions; Next.js + Tailwind; mixed Motion (motion.dev) and GSAP.
- Install: shadcn CLI 3 registry, namespace @skiper-ui
  (`npx shadcn add @skiper-ui/<component>`); Pro tier authenticates via
  license key in .env.local + registry entry in components.json.
- License (verified from official docs): free tier usable in personal and
  commercial projects WITH REQUIRED ATTRIBUTION to Skiper UI; Premium
  $129 / Exclusive $549 one-time remove attribution. Full ToS page was
  not retrievable (404) at verification time: flag this gap to users.
- Fit: high-flair brand-surface moments on Next+shadcn stacks. Their own
  docs state many components recreate other products' UI (Dynamic Island
  class): fine as patterns; warn users against cloning a recognizable
  third-party interface wholesale.
- Cautions: no published accessibility posture (audit each component);
  solo maintainer; decorative tier, not a primitives layer.
- When using free tier: add the attribution and record it in
  DESIGN-SYSTEM.md. Never share or bypass license keys.

## Vengeance UI (https://www.vengenceui.com/)

- What: 46 free animated landing components; React + TypeScript +
  Tailwind + Framer Motion; copy-paste + claimed shadcn registry.
- License: NONE PUBLISHED (verified: no LICENSE file; terms defer to a
  nonexistent repository license). Default = all rights reserved,
  despite "free and open source" marketing.
- Policy: INSPIRATION ONLY until a license is published. Do not copy its
  code into client or commercial work. Its patterns (Framer Motion
  choreography ideas) may inform original implementations. Label it
  "no published license - verify before commercial use" whenever it
  comes up.
- Cautions: solo maintainer; no accessibility claims; docs/marketing
  inconsistencies observed.

## shadcn/ui ecosystem (context)

Both libraries ride shadcn conventions: code is vendored into the
project (components/ui), which means adopted components become PROJECT
code: retokenize them, test them, and maintain them like your own. The
vendoring model is why the vetting checklist and registration in
policy.md are mandatory: there is no upstream to fix issues later.

## Default position

No external flair library is required. The plugin's directions +
references produce complete interfaces without them. Reach for the
catalog when a brief needs a specific high-effort pattern whose original
implementation would cost more than vetting + adapting, and the license
allows it. When the stack is not Next/React+Tailwind, the extraction
path in policy.md applies automatically.
