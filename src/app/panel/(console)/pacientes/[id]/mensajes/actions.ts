"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { getPatientDetail } from "@/modules/patient/repository";
import { sendMessage } from "@/modules/messaging/repository";
import { appUrl, sendEmail } from "@/lib/email";

export type MessageFormState =
  | { errorKey: string; body?: string }
  | { ok: true }
  | null;

export async function sendSpecialistMessageAction(
  _prevState: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> {
  const body = ((formData.get("body") as string) ?? "").trim();
  if (!body || body.length > 4000) {
    return { errorKey: "invalidBody", body };
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic", body };
  }
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[sendSpecialistMessageAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return { errorKey: "generic", body };
  }
  const { data: organizations } = await auth.organization.list();
  const active = organizations?.[0];
  if (!active) {
    return { errorKey: "generic", body };
  }
  const org = await ensureOrganization(active.id, active.name);

  const patientId = (formData.get("patientId") as string) ?? "";
  const patient = await getPatientDetail(org.id, patientId);
  if (!patient) {
    return { errorKey: "generic", body };
  }

  try {
    await sendMessage({
      organizationId: org.id,
      patientId: patient.id,
      sender: "SPECIALIST",
      senderAuthUserId: session.user.id,
      body,
    });
  } catch (error) {
    console.error("[sendSpecialistMessageAction] sendMessage failed", error);
    return { errorKey: "generic", body };
  }

  // Best-effort nudge - never the message content (slice 11 guardrail).
  if (patient.status === "ACTIVE") {
    await sendEmail({
      to: patient.email,
      subject: "Tienes un mensaje nuevo de tu consulta",
      html: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
  <p style="font-size:18px;font-weight:600;margin:0 0 16px">Nutrionyx</p>
  <p style="font-size:15px;line-height:1.5">Tu consulta te ha escrito. Léelo en tu espacio:</p>
  <p style="margin:24px 0"><a href="${appUrl()}/mi-espacio/mensajes" style="background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:600">Ver mensaje</a></p>
</div>`,
    });
  }

  revalidatePath(`/panel/pacientes/${patient.id}/mensajes`);
  revalidatePath(`/panel/pacientes/${patient.id}`);
  return { ok: true };
}
