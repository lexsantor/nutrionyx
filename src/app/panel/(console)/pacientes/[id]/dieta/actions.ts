"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { getPatientDetail } from "@/modules/patient/repository";
import { upsertDietPlan } from "@/modules/diet/repository";
import {
  contentFromEntries,
  isEmptyPlan,
  normalizeContent,
} from "@/modules/diet/plan";
import {
  TEMPLATE_NAME_MAX,
  getDietTemplate,
  saveDietTemplate,
} from "@/modules/diet/templates";

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

export type TemplateFormState =
  | { errorKey: string }
  | { ok: true; kind: "saved" | "loaded" }
  | null;

/**
 * Save the week currently in the editor as a reusable template. The week
 * arrives in the same fields the plan save uses, so what gets stored is
 * exactly what the specialist is looking at — not the last persisted plan.
 */
export async function saveDietTemplateAction(
  _prevState: TemplateFormState,
  formData: FormData,
): Promise<TemplateFormState> {
  const name = ((formData.get("templateName") as string) ?? "")
    .trim()
    .slice(0, TEMPLATE_NAME_MAX);
  if (!name) return { errorKey: "nameRequired" };

  const content = normalizeContent(
    contentFromEntries(
      [...formData.entries()].filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
  );
  if (!content) return { errorKey: "invalidContent" };
  if (isEmptyPlan(content)) return { errorKey: "emptyPlan" };

  const { data: session } = await auth.getSession();
  if (!session?.user) return { errorKey: "generic" };
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[saveDietTemplateAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return { errorKey: "generic" };
  }
  const { data: organizations } = await auth.organization.list();
  const active = organizations?.[0];
  if (!active) return { errorKey: "generic" };
  const org = await ensureOrganization(active.id, active.name);

  try {
    await saveDietTemplate({
      organizationId: org.id,
      name,
      content,
      createdByAuthUserId: session.user.id,
    });
  } catch (error) {
    console.error("[saveDietTemplateAction] save failed", error);
    return { errorKey: "generic" };
  }

  const patientId = (formData.get("patientId") as string) ?? "";
  revalidatePath(`/panel/pacientes/${patientId}/dieta`);
  return { ok: true, kind: "saved" };
}

/**
 * Load a template into the patient's plan. This overwrites the stored
 * week, so the editor asks for confirmation before submitting.
 */
export async function loadDietTemplateAction(
  _prevState: TemplateFormState,
  formData: FormData,
): Promise<TemplateFormState> {
  const templateId = (formData.get("templateId") as string) ?? "";
  if (!templateId) return { errorKey: "generic" };

  const { data: session } = await auth.getSession();
  if (!session?.user) return { errorKey: "generic" };
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[loadDietTemplateAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return { errorKey: "generic" };
  }
  const { data: organizations } = await auth.organization.list();
  const active = organizations?.[0];
  if (!active) return { errorKey: "generic" };
  const org = await ensureOrganization(active.id, active.name);

  const patientId = (formData.get("patientId") as string) ?? "";
  const patient = await getPatientDetail(org.id, patientId);
  if (!patient) return { errorKey: "generic" };

  // Org-scoped read: a template id from another consulta resolves to null.
  const template = await getDietTemplate(org.id, templateId);
  if (!template) return { errorKey: "notFound" };

  const content = normalizeContent(template.content);
  if (!content) return { errorKey: "invalidContent" };

  try {
    await upsertDietPlan({
      organizationId: org.id,
      patientId: patient.id,
      title: (formData.get("title") as string)?.trim().slice(0, 120) || null,
      notes: (formData.get("notes") as string)?.trim().slice(0, 2000) || null,
      content,
      updatedByAuthUserId: session.user.id,
    });
  } catch (error) {
    console.error("[loadDietTemplateAction] upsertDietPlan failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath(`/panel/pacientes/${patient.id}`);
  revalidatePath(`/panel/pacientes/${patient.id}/dieta`);
  return { ok: true, kind: "loaded" };
}
