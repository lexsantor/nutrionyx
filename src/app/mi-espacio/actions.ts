"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { madridDayStart } from "@/modules/scheduling/time";
import {
  recordMetric,
  recordProtein,
  recordWeight,
} from "@/modules/measurement/repository";

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
    // Future-dated weights would corrupt the 28-day adherence window.
    if (parsed >= madridDayStart(1)) {
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

export type BodyMetricsFormState = { errorKey: string } | { ok: true } | null;

const BODY_FIELDS = [
  { name: "chestCm", kind: "CHEST_CM", min: 10, max: 250 },
  { name: "armCm", kind: "ARM_CM", min: 10, max: 250 },
  { name: "waistCm", kind: "WAIST_CM", min: 10, max: 250 },
  { name: "hipCm", kind: "HIP_CM", min: 10, max: 250 },
  { name: "thighCm", kind: "THIGH_CM", min: 10, max: 250 },
  { name: "gluteCm", kind: "GLUTE_CM", min: 10, max: 250 },
  { name: "calfCm", kind: "CALF_CM", min: 10, max: 250 },
  { name: "bodyFatPct", kind: "BODY_FAT_PCT", min: 1, max: 75 },
] as const;

export async function recordBodyMetricsAction(
  _prevState: BodyMetricsFormState,
  formData: FormData,
): Promise<BodyMetricsFormState> {
  const entries: { kind: (typeof BODY_FIELDS)[number]["kind"]; value: number }[] =
    [];
  for (const field of BODY_FIELDS) {
    const raw = ((formData.get(field.name) as string) ?? "")
      .trim()
      .replace(",", ".");
    if (!raw) continue;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < field.min || value > field.max) {
      return { errorKey: "invalidBodyMetric" };
    }
    entries.push({ kind: field.kind, value });
  }
  if (entries.length === 0) {
    return { errorKey: "emptyBodyMetrics" };
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic" };
  }
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    return { errorKey: "generic" };
  }

  try {
    for (const entry of entries) {
      await recordMetric({
        organizationId: patient.organizationId,
        patientId: patient.id,
        kind: entry.kind,
        value: entry.value,
      });
    }
  } catch (error) {
    console.error("[recordBodyMetricsAction] recordMetric failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath("/mi-espacio");
  return { ok: true };
}

export type PhotoDeleteState = { errorKey: string } | null;

export async function deletePhotoAction(
  _prevState: PhotoDeleteState,
  formData: FormData,
): Promise<PhotoDeleteState> {
  const photoId = (formData.get("photoId") as string) ?? "";
  if (!photoId) return { errorKey: "generic" };

  const { data: session } = await auth.getSession();
  if (!session?.user) return { errorKey: "generic" };
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) return { errorKey: "generic" };

  const { deletePhoto } = await import("@/modules/photos/repository");
  const photo = await deletePhoto(patient.organizationId, patient.id, photoId);
  if (!photo) return { errorKey: "generic" };

  try {
    const { delPrivate } = await import("@/lib/blob-private");
    await delPrivate(photo.pathname);
  } catch (error) {
    console.error("[deletePhotoAction] blob delete failed", error);
  }

  revalidatePath("/mi-espacio");
  return null;
}

export type ProteinFormState = { errorKey: string } | { ok: true } | null;

export async function recordProteinAction(
  _prevState: ProteinFormState,
  formData: FormData,
): Promise<ProteinFormState> {
  const raw = ((formData.get("grams") as string) ?? "")
    .trim()
    .replace(",", ".");
  const grams = Number(raw);
  if (!raw || !Number.isFinite(grams) || grams <= 0 || grams > 300) {
    return { errorKey: "invalidProtein" };
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic" };
  }
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    return { errorKey: "generic" };
  }

  try {
    await recordProtein({
      organizationId: patient.organizationId,
      patientId: patient.id,
      grams,
    });
  } catch (error) {
    console.error("[recordProteinAction] recordProtein failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath("/mi-espacio");
  return { ok: true };
}
