import { plansDueOn } from "@/modules/medication/repository";
import { appointmentsBetween } from "@/modules/scheduling/repository";
import { madridDayStart } from "@/modules/scheduling/time";
import { appendEvent } from "@/modules/events";
import { appUrl, doseReminderEmail, sendEmail } from "@/lib/email";

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

  // Cita reminders: tomorrow's Madrid calendar day (slice-20). Time and
  // modality only - no clinical content (slice 11 guardrail).
  const citas = await appointmentsBetween(
    madridDayStart(1, now),
    madridDayStart(2, now),
  );
  let citasSent = 0;
  for (const cita of citas) {
    const hora = cita.startsAt.toLocaleTimeString("es-ES", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
    });
    const ok = await sendEmail({
      to: cita.patient.email,
      subject: `Recordatorio: cita mañana a las ${hora}`,
      html: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
  <p style="font-size:18px;font-weight:600;margin:0 0 16px">Nutrionyx</p>
  <p style="font-size:15px;line-height:1.5">Mañana tienes cita con tu consulta a las <strong>${hora}</strong>${cita.mode === "VIDEO" ? " por videollamada" : ""}.</p>
  <p style="margin:24px 0"><a href="${appUrl()}/mi-espacio" style="background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:600">Ver detalles</a></p>
</div>`,
    });
    if (!ok) continue;
    citasSent++;
    await appendEvent({
      organizationId: cita.organizationId,
      aggregate: "Patient",
      aggregateId: cita.patientId,
      type: "AppointmentReminderSent",
      payload: { appointmentId: cita.id, channel: "email" },
    });
  }

  return Response.json({
    due: due.length,
    sent,
    citas: citas.length,
    citasSent,
  });
}
