# Slice 19 - Messaging v1 (async thread)

Status: in progress. Tier 3. One conversation per patient: patient ↔ their
consulta. Async by design - no WebSockets/realtime infra; messages load on
navigation and revalidate on send. The product value is a GDPR-safe channel
inside the app instead of WhatsApp.

## Domain

- `Message`: org-scoped, patientId is the thread key. sender (SPECIALIST |
  PATIENT), senderAuthUserId, body (1-4000 chars), `readAt` - set when the
  counterpart opens the thread (mark-all-read; no per-message receipts).
  Append-only in practice (no edit/delete v1). Event `MessageSent`
  (ids only, never content).

## Read model

- Patient thread page marks counterpart messages read; same for the
  specialist side.
- Panel pacientes list shows an unread badge per patient (one groupBy);
  patient detail card shows unread count + link. Patient side has the nav
  entry (email nudge covers discovery).

## Notifications

Specialist → patient send fires a best-effort email nudge (no content,
just a link - slice 11 guardrail). Patient → specialist relies on the
panel badges v1 (the specialist's email is not readily addressable;
revisit with notification preferences).

## Out of scope

Realtime, attachments, audio/video, templates, edit/delete, per-message
receipts, team routing (single-specialist consultas today).

## Gates

tsc · lint · vitest · build; isolation (thread + unread scoped);
migration `messaging`.
