"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { setMealNote, setMealStatus } from "@/modules/diet/meal-log";
import { MEAL_SLOTS, type MealSlot } from "@/modules/diet/plan";
import type { MealStatus } from "@/generated/prisma/client";

export type MealLogState = { errorKey: string } | { ok: true } | null;

const STATUSES = ["DONE", "CHANGED", "SKIPPED"] as const;

/**
 * The patient marks one meal of today. Only today: marking a week in advance
 * says nothing, and letting them edit the past turns a diary into a form.
 */
export async function markMealAction(
  _prev: MealLogState,
  formData: FormData,
): Promise<MealLogState> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return { errorKey: "session" };
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) return { errorKey: "session" };

  const slot = String(formData.get("slot") ?? "");
  if (!(MEAL_SLOTS as readonly string[]).includes(slot)) {
    return { errorKey: "slot" };
  }

  const raw = String(formData.get("status") ?? "");
  // An empty status clears the mark: tapping the active button again undoes
  // it, which is the only way out of a mis-tap.
  const status = (STATUSES as readonly string[]).includes(raw)
    ? (raw as MealStatus)
    : null;

  await setMealStatus({
    organizationId: patient.organizationId,
    patientId: patient.id,
    day: new Date(),
    slot: slot as MealSlot,
    status,
  });

  revalidatePath("/mi-espacio/dieta");
  revalidatePath("/mi-espacio");
  return { ok: true };
}

/**
 * What the patient ate instead, or why they skipped. Its own action so that
 * saving a note can never move the status the buttons own.
 */
export async function noteMealAction(
  _prev: MealLogState,
  formData: FormData,
): Promise<MealLogState> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return { errorKey: "session" };
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) return { errorKey: "session" };

  const slot = String(formData.get("slot") ?? "");
  if (!(MEAL_SLOTS as readonly string[]).includes(slot)) {
    return { errorKey: "slot" };
  }

  await setMealNote({
    organizationId: patient.organizationId,
    patientId: patient.id,
    day: new Date(),
    slot: slot as MealSlot,
    note: String(formData.get("note") ?? ""),
  });

  revalidatePath("/mi-espacio/dieta");
  return { ok: true };
}
