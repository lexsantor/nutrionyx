import { plansDueOn } from "@/modules/medication/repository";
import { appendEvent } from "@/modules/events";
import { doseReminderEmail, sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Daily dose-reminder cron (docs/build/slice-11-plan.md). Vercel invokes it
 * at 08:00 UTC (vercel.json) with `Authorization: Bearer CRON_SECRET`.
 * ponytail: naive timezone - at 08:00 UTC the calendar day matches
 * Europe/Madrid (es-only, adr/0001); per-patient timezones when they exist.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const due = await plansDueOn(now.getDay(), now);

  let sent = 0;
  for (const plan of due) {
    const ok = await sendEmail({
      to: plan.email,
      ...doseReminderEmail({ patientName: plan.fullName ?? "" }),
    });
    if (!ok) continue;
    sent++;
    await appendEvent({
      organizationId: plan.organizationId,
      aggregate: "Patient",
      aggregateId: plan.patientId,
      type: "MedicationReminderSent",
      payload: { channel: "email" },
    });
  }

  return Response.json({ due: due.length, sent });
}
