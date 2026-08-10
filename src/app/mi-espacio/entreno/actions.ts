"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { logSession } from "@/modules/training/repository";

export type SessionFormState = { errorKey: string } | { ok: true } | null;

export async function logSessionAction(
  _prevState: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const note =
    ((formData.get("note") as string) ?? "").trim().slice(0, 500) || null;

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic" };
  }
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    return { errorKey: "generic" };
  }

  try {
    const logged = await logSession({
      organizationId: patient.organizationId,
      patientId: patient.id,
      note,
    });
    if (!logged) {
      return { errorKey: "alreadyToday" };
    }
  } catch (error) {
    console.error("[logSessionAction] logSession failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath("/mi-espacio/entreno");
  revalidatePath("/mi-espacio");
  return { ok: true };
}
