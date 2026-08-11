"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { getPatientDetail } from "@/modules/patient/repository";
import { upsertDietPlan } from "@/modules/diet/repository";
import {
  DAYS_PER_WEEK,
  MEAL_SLOTS,
  normalizeContent,
  type DietPlanContent,
} from "@/modules/diet/plan";

export type DietPlanFormState = { errorKey: string } | { ok: true } | null;

export async function saveDietPlanAction(
  _prevState: DietPlanFormState,
  formData: FormData,
): Promise<DietPlanFormState> {
  const title = ((formData.get("title") as string) ?? "").trim().slice(0, 120);
  const notes = ((formData.get("notes") as string) ?? "").trim().slice(0, 2000);

  const raw: DietPlanContent = { days: [] };
  for (let day = 0; day < DAYS_PER_WEEK; day++) {
    const meals: Record<string, string> = {};
    for (const slot of MEAL_SLOTS) {
      meals[slot] = (formData.get(`meal-${day}-${slot}`) as string) ?? "";
    }
    raw.days.push(meals);
  }
  const content = normalizeContent(raw);
  if (!content) {
    return { errorKey: "invalidContent" };
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic" };
  }
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[saveDietPlanAction] non-nutritionist attempted", {
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
    await upsertDietPlan({
      organizationId: org.id,
      patientId: patient.id,
      title: title || null,
      notes: notes || null,
      content,
      updatedByAuthUserId: session.user.id,
    });
  } catch (error) {
    console.error("[saveDietPlanAction] upsertDietPlan failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath(`/panel/pacientes/${patient.id}`);
  revalidatePath(`/panel/pacientes/${patient.id}/dieta`);
  return { ok: true };
}
