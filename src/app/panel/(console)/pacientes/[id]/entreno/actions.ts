"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { getPatientDetail } from "@/modules/patient/repository";
import { upsertRoutine } from "@/modules/training/repository";
import {
  DAYS_PER_WEEK,
  normalizeRoutine,
} from "@/modules/training/routine";

export type RoutineFormState =
  | { errorKey: string; values?: Record<string, string> }
  | { ok: true }
  | null;

export async function saveRoutineAction(
  _prevState: RoutineFormState,
  formData: FormData,
): Promise<RoutineFormState> {
  const title = ((formData.get("title") as string) ?? "").trim().slice(0, 120);
  const notes = ((formData.get("notes") as string) ?? "").trim().slice(0, 2000);
  // Echo submitted values so the editor re-hydrates after the reset.
  const values = Object.fromEntries(
    [...formData.entries()]
      .filter(([k, v]) => typeof v === "string" && k !== "patientId")
      .map(([k, v]) => [k, v as string]),
  );
  const content = normalizeRoutine({
    days: Array.from(
      { length: DAYS_PER_WEEK },
      (_, day) => (formData.get(`day-${day}`) as string) ?? "",
    ),
  });
  if (!content) {
    return { errorKey: "invalidContent", values };
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic", values };
  }
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[saveRoutineAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return { errorKey: "generic", values };
  }
  const { data: organizations } = await auth.organization.list();
  const active = organizations?.[0];
  if (!active) {
    return { errorKey: "generic", values };
  }
  const org = await ensureOrganization(active.id, active.name);

  const patientId = (formData.get("patientId") as string) ?? "";
  const patient = await getPatientDetail(org.id, patientId);
  if (!patient) {
    return { errorKey: "generic", values };
  }

  try {
    await upsertRoutine({
      organizationId: org.id,
      patientId: patient.id,
      title: title || null,
      notes: notes || null,
      content,
      updatedByAuthUserId: session.user.id,
    });
  } catch (error) {
    console.error("[saveRoutineAction] upsertRoutine failed", error);
    return { errorKey: "generic", values };
  }

  revalidatePath(`/panel/pacientes/${patient.id}`);
  revalidatePath(`/panel/pacientes/${patient.id}/entreno`);
  return { ok: true };
}
