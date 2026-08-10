/**
 * Transactional email via Resend (docs/build/slice-11-plan.md). One authed
 * fetch - no SDK. Guardrail: email bodies NEVER carry clinical data (GDPR
 * Art. 9) - no drug names, no weights, only neutral nudges and links.
 * Missing RESEND_API_KEY skips the send gracefully (dev, CI).
 */
const FROM = process.env.EMAIL_FROM ?? "Nutrionyx <onboarding@resend.dev>";

export function appUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set - skipping send", {
      subject: params.subject,
    });
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, ...params }),
  });
  if (!res.ok) {
    console.error("[email] send failed", res.status, await res.text());
    return false;
  }
  return true;
}

// es-only templates (adr/0001). Minimal inline styles; dark-mode-safe colors.
function layout(body: string): string {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
  <p style="font-size:18px;font-weight:600;margin:0 0 16px">Nutrionyx</p>
  ${body}
  <p style="font-size:12px;color:#777;margin-top:24px">Este es un mensaje automático de Nutrionyx.</p>
</div>`;
}

export function inviteEmail(params: {
  consultaName: string;
  invitationId: string;
}): { subject: string; html: string } {
  const link = `${appUrl()}/auth/accept-invitation?invitationId=${params.invitationId}`;
  return {
    subject: `${params.consultaName} te invita a Nutrionyx`,
    html: layout(`
  <p style="font-size:15px;line-height:1.5"><strong>${escapeHtml(params.consultaName)}</strong> te ha invitado a su consulta en Nutrionyx para acompañarte en tu plan de nutrición.</p>
  <p style="margin:24px 0"><a href="${link}" style="background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:600">Aceptar invitación</a></p>
  <p style="font-size:13px;color:#555;line-height:1.5">Si el botón no funciona, copia este enlace:<br>${link}</p>`),
  };
}

export function doseReminderEmail(params: { patientName: string }): {
  subject: string;
  html: string;
} {
  const link = `${appUrl()}/mi-espacio/medicacion`;
  return {
    subject: "Hoy toca tu medicación",
    html: layout(`
  <p style="font-size:15px;line-height:1.5">Hola ${escapeHtml(params.patientName)}, hoy es tu día de medicación. Regístrala en tu espacio cuando la tomes.</p>
  <p style="margin:24px 0"><a href="${link}" style="background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:600">Registrar dosis</a></p>`),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
