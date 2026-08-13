"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import {
  getPlan,
  logDose,
  setSharing,
  upsertPlan,
} from "@/modules/medication/repository";
import { GLP1_PRESETS, SITE_ROTATION } from "@/modules/medication/glp1";
import type { InjectionSite } from "@/generated/prisma/client";

export type MedicationFormState =
  | { errorKey: string }
  | { ok: true }
  | null;

export type SharingState = { errorKey: string } | { ok: true } | null;

function parseDose(formData: FormData): number | null {
  const raw = ((formData.get("doseMg") as string) ?? "").trim().replace(",", ".");
  const dose = Number(raw);
  if (!raw || !Number.isFinite(dose) || dose <= 0 || dose > 100) return null;
  return dose;
}

async function requirePatient() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  return findPatientByAuthUserId(session.user.id);
}

export async function savePlanAction(
  _prevState: MedicationFormState,
  formData: FormData,
): Promise<MedicationFormState> {
  const presetKey = (formData.get("preset") as string) ?? "";
  const preset = GLP1_PRESETS.find((p) => p.key === presetKey) ?? null;

  let drugName: string;
  let genericName: string | null;
  let frequency: "WEEKLY" | "DAILY";
  if (preset) {
    drugName = preset.brand;
    genericName = preset.generic;
    frequency = preset.frequency;
  } else if (presetKey === "custom") {
    drugName = ((formData.get("drugName") as string) ?? "").trim();
    genericName = null;
    const rawFrequency = (formData.get("frequency") as string) ?? "";
    if (rawFrequency !== "WEEKLY" && rawFrequency !== "DAILY") {
      return { errorKey: "invalidDrug" };
    }
    frequency = rawFrequency;
    if (!drugName || drugName.length > 80) {
      return { errorKey: "invalidDrug" };
    }
  } else {
    return { errorKey: "invalidDrug" };
  }

  const doseMg = parseDose(formData);
  if (doseMg == null) return { errorKey: "invalidDose" };

  let shotDay: number | null = null;
  if (frequency === "WEEKLY") {
    const raw = (formData.get("shotDay") as string) ?? "";
    shotDay = Number(raw);
    if (!Number.isInteger(shotDay) || shotDay < 0 || shotDay > 6) {
      return { errorKey: "invalidShotDay" };
    }
  }

  const patient = await requirePatient();
  if (!patient) return { errorKey: "generic" };

  try {
    await upsertPlan({
      organizationId: patient.organizationId,
      patientId: patient.id,
      drugName,
      genericName,
      frequency,
      doseMg,
      shotDay,
    });
  } catch (error) {
    console.error("[savePlanAction] upsertPlan failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath("/mi-espacio");
  revalidatePath("/mi-espacio/medicacion");
  return { ok: true };
}

export async function logDoseAction(
  _prevState: MedicationFormState,
  formData: FormData,
): Promise<MedicationFormState> {
  const doseMg = parseDose(formData);
  if (doseMg == null) return { errorKey: "invalidDose" };

  const site = (formData.get("site") as string) ?? "";
  if (!SITE_ROTATION.includes(site as InjectionSite)) {
    return { errorKey: "invalidSite" };
  }

  let takenAt: Date | undefined;
  const dateRaw = ((formData.get("takenAt") as string) ?? "").trim();
  if (dateRaw) {
    const parsed = new Date(`${dateRaw}T12:00:00`);
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() > Date.now()) {
      return { errorKey: "invalidDate" };
    }
    takenAt = parsed;
  }

  const patient = await requirePatient();
  if (!patient) return { errorKey: "generic" };

  const plan = await getPlan(patient.organizationId, patient.id);
  if (!plan) return { errorKey: "noPlan" };

  try {
    await logDose({
      organizationId: patient.organizationId,
      patientId: patient.id,
      drugName: plan.drugName,
      doseMg,
      site: site as InjectionSite,
      takenAt,
    });
  } catch (error) {
    console.error("[logDoseAction] logDose failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath("/mi-espacio");
  revalidatePath("/mi-espacio/medicacion");
  return { ok: true };
}


/**
 * The patient turns sharing with their specialist on or off. Only the patient
 * can: there is no console path to this, by design.
 */
export async function setSharingAction(
  _prevState: SharingState,
  formData: FormData,
): Promise<SharingState> {
  const patient = await requirePatient();
  if (!patient) return { errorKey: "errors.session" };

  const shared = formData.get("shared") === "on";
  await setSharing(patient.organizationId, patient.id, shared);

  revalidatePath("/mi-espacio/medicacion");
  revalidatePath("/mi-espacio");
  return { ok: true };
}
