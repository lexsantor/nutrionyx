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

export type RoutineFormState = { errorKey: string } | { ok: true } | null;

export async function saveRoutineAction(
  _prevState: RoutineFormState,
  formData: FormData,
): Promise<RoutineFormState> {
  const title = ((formData.get("title") as string) ?? "").trim().slice(0, 120);
  const notes = ((formData.get("notes") as string) ?? "").trim().slice(0, 2000);
  const content = normalizeRoutine({
    days: Array.from(
      { length: DAYS_PER_WEEK },
      (_, day) => (formData.get(`day-${day}`) as string) ?? "",
    ),
  });
  if (!content) {
    return { errorKey: "invalidContent" };
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic" };
  }
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[saveRoutineAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return { errorKey: "generic" };
  }
  const { data: organizations } = await auth.organization.list();
  const active = organizations?.[0];
  if (!active) {
    return { errorKey: "generic" };
  }
  const org = await ensureOrganization(active.id, active.name);

  const patientId = (formData.get("patientId") as string) ?? "";
  const patient = await getPatientDetail(org.id, patientId);
  if (!patient) {
    return { errorKey: "generic" };
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
    return { errorKey: "generic" };
  }

  revalidatePath(`/panel/pacientes/${patient.id}`);
  revalidatePath(`/panel/pacientes/${patient.id}/entreno`);
  return { ok: true };
}
