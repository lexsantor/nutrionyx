"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { sendMessage } from "@/modules/messaging/repository";

export type MessageFormState =
  | { errorKey: string; body?: string }
  | { ok: true }
  | null;

export async function sendPatientMessageAction(
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
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    return { errorKey: "generic", body };
  }

  try {
    await sendMessage({
      organizationId: patient.organizationId,
      patientId: patient.id,
      sender: "PATIENT",
      senderAuthUserId: session.user.id,
      body,
    });
  } catch (error) {
    console.error("[sendPatientMessageAction] sendMessage failed", error);
    return { errorKey: "generic", body };
  }

  revalidatePath("/mi-espacio/mensajes");
  return { ok: true };
}
