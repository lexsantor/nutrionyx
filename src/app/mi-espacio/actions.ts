"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { recordWeight } from "@/modules/measurement/repository";

export type WeightFormState = { errorKey: string } | { ok: true } | null;

export async function recordWeightAction(
  _prevState: WeightFormState,
  formData: FormData,
): Promise<WeightFormState> {
  const raw = ((formData.get("weightKg") as string) ?? "")
    .trim()
    .replace(",", ".");
  const valueKg = Number(raw);
  if (!raw || !Number.isFinite(valueKg) || valueKg <= 0 || valueKg > 500) {
    return { errorKey: "invalidWeight" };
  }

  let recordedAt: Date | undefined;
  const dateRaw = ((formData.get("recordedAt") as string) ?? "").trim();
  if (dateRaw) {
    const parsed = new Date(`${dateRaw}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return { errorKey: "invalidDate" };
    }
    recordedAt = parsed;
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic" };
  }

  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    console.error("[recordWeightAction] no patient row for user", {
      userId: session.user.id,
    });
    return { errorKey: "generic" };
  }

  try {
    await recordWeight({
      organizationId: patient.organizationId,
      patientId: patient.id,
      valueKg,
      recordedAt,
    });
  } catch (error) {
    console.error("[recordWeightAction] recordWeight failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath("/mi-espacio");
  return { ok: true };
}
