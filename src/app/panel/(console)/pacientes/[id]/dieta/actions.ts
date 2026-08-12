"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { getPatientDetail } from "@/modules/patient/repository";
import { upsertDietPlan } from "@/modules/diet/repository";
import { contentFromEntries, normalizeContent } from "@/modules/diet/plan";

export type DietPlanFormState =
  | { errorKey: string; values?: Record<string, string> }
  | { ok: true }
  | null;

export async function saveDietPlanAction(
  _prevState: DietPlanFormState,
  formData: FormData,
): Promise<DietPlanFormState> {
  const title = ((formData.get("title") as string) ?? "").trim().slice(0, 120);
  const notes = ((formData.get("notes") as string) ?? "").trim().slice(0, 2000);
  // React 19 resets the form after the action even on error: echo the
  // submitted values back so the editor can re-hydrate (no data loss).
  const values = Object.fromEntries(
    [...formData.entries()]
      .filter(([k, v]) => typeof v === "string" && k !== "patientId")
      .map(([k, v]) => [k, v as string]),
  );

  const content = normalizeContent(
    contentFromEntries(
      [...formData.entries()].filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
  );
  if (!content) {
    return { errorKey: "invalidContent", values };
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic", values };
  }
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[saveDietPlanAction] non-nutritionist attempted", {
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
    return { errorKey: "generic", values };
  }

  revalidatePath(`/panel/pacientes/${patient.id}`);
  revalidatePath(`/panel/pacientes/${patient.id}/dieta`);
  return { ok: true };
}
