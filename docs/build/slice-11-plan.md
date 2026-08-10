# Slice 11 - Transactional email (Resend)

Status: in progress. Tier 1 closer (roadmap-feature-tiers.md). Marketplace
checkout was broken for the Free plan (checkout blocked for every region), so
provisioning fell back to a direct free Resend account + `RESEND_API_KEY` env
var (fallback path sanctioned by the storage skill). No SDK: one authed fetch
to `api.resend.com/emails`.

## Guardrails

- **No clinical data in email bodies** (GDPR Art. 9): no drug names, no
  weights. "Te toca tu medicación", never "tu dosis de Wegovy".
- Missing `RESEND_API_KEY` degrades gracefully: send is skipped with a
  warning, features never break.
- Sender: `onboarding@resend.dev` sandbox until the owner verifies a domain
  (`EMAIL_FROM` env var overrides).

## Built

1. `src/lib/email.ts` - `sendEmail` (fetch, Bearer key), `appUrl()` base-URL
   helper, es-only templates (adr/0001): invite + dose reminder.
2. **Invite email**: `invitePatient` captures the invitation id and emails the
   patient their accept link. Send failure never fails the invite.
3. **Dose reminder cron**: `vercel.json` cron 08:00 UTC daily →
   `/api/cron/reminders` (Bearer `CRON_SECRET`): weekly plans whose `shotDay`
   is today, patient ACTIVE, no dose logged today → one reminder each; event
   `MedicationReminderSent` per send.

## Out of scope

Weigh-in reminders and daily-plan reminders (volume/annoyance - revisit with
evidence); patient notification preferences; domain verification (owner, when
a domain exists).

## Gates

tsc · lint · vitest · build; no schema change (no migration).
