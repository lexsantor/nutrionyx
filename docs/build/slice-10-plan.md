# Slice 10 - Tier 1 batch: notes, patient nav, logo, email groundwork

Status: in progress. Source: docs/build/roadmap-feature-tiers.md Tier 1,
owner said "procede con tier 1" (2026-08-10).

## 1. Specialist notes (S)

- `PatientNote`: append-only (PRD_03 rules 5-6 - a correction is a new note),
  org-scoped, specialist-private (no patient surface). Fields: body (text,
  1-4000 chars), authorAuthUserId, createdAt. Event `NoteAdded`.
- Panel patient detail: "Notas" card - textarea + list newest-first with date.
- Isolation test: notes invisible cross-org.

## 2. Patient nav parity (S)

- Restore `NavLink` (center nav, active state) and pass a patient menu
  (Inicio · Medicación) to the existing `Topbar` on /mi-espacio pages.
- Wizard (evaluación) stays focused - no nav.

## 3. Consulta logo upload (S)

- Vercel Blob (`@vercel/blob`), public store; `Organization.logoUrl` already
  exists. Ajustes profile form gains a file input; server action validates
  (image type, <= 2 MB) and stores the URL. Needs `BLOB_READ_WRITE_TOKEN`
  (store provisioned via Vercel).

## 4. Email notifications (M) - decision pending

- Provider selection surfaced to the owner (EU/GDPR: transactional only,
  never clinical content in email bodies - invite, dose/weigh-in nudges).
- Scoped in a follow-up slice once the provider is chosen.

## Gates

tsc · lint · vitest · build; isolation extended (notes); owner runs
`npx prisma migrate dev --name patient_notes`.
