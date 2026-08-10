# Product

## Register

product

## Users

- **Specialist (nutritionist / sports nutritionist)**: runs their own consulta (org). Works at a desk between consultations; manages patients, reviews progress, sets up treatment. Fluent in clinical SaaS (Healthie, Nutrium, Practice Better reference class).
- **Patient**: invited by their specialist. Uses the app on their phone, in short sessions (30-second check-ins). Logs weight, doses, progress; follows their plan.
- **Platform owner**: business metrics only; never sees patient clinical data (operator-blindness, adr/0004).

## Product Purpose

Multi-tenant clinical SaaS for nutrition & coaching professionals and their patients (docs/00). Clinical treatment, progress monitoring, and practice operations with EU-grade privacy (GDPR Art. 9 health data) as a floor. Success: the specialist runs their whole consulta here; the patient's daily check-in takes under a minute.

## Brand Personality

Calm, clinical, trustworthy. Spanish-language UI (adr/0001). Console adapted from Pulse CRM patterns (adr/0005): quiet surfaces, clear hierarchy, data-forward. The tool disappears into the task.

## Anti-references

- Consumer fitness-app gamification: streaks, guilt, confetti, badges.
- SaaS-cream marketing gloss inside the app.
- Dark neon "biohacker" aesthetic (reference screenshots are input for features, not for visual identity - NORTE tokens rule).

## Design Principles

1. **Clinical calm**: neutral surfaces, one accent, semantic state colors only.
2. **Phone-first patient, desk-first specialist**: /mi-espacio designs at 390px up; /panel designs at desktop density with responsive collapse.
3. **Facts are append-only**: history is shown as a log, corrections are new entries - the UI never pretends data can be rewritten.
4. **Never prescribe**: the product records what the patient's prescriber ordered; it never suggests doses or clinical decisions.
5. **Earned familiarity**: standard affordances, same component vocabulary on every screen (ui/button, ui/card, ui/input, NORTE tokens).

## Accessibility & Inclusion

- Language: es (single locale via next-intl).
- WCAG AA contrast; visible focus rings (token `--color-focus-ring`); form controls are native inputs with labels.
- Dark mode is first-class (data-theme, tokens in globals.css).
- prefers-reduced-motion respected for any non-trivial motion.
