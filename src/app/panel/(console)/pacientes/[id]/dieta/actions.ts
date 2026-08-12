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
import type { EditorIntent } from "@/components/template-bar";
import type { Organization } from "@/generated/prisma/client";

/**
 * One action for the whole editor form, branching on the `intent` carried
 * by the pressed submit button. See the routine editor's actions.ts for
 * why the three stopped being separate formAction targets.
 */
export type DietPlanFormState =
  | { errorKey: string; scope: Scope; values?: Record<string, string> }
  | { ok: true; scope: Scope; kind?: "saved" | "loaded" }
  | null;

type Scope = "plan" | "template";

async function specialistContext(): Promise<
  { userId: string; org: Organization } | null
> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[dietFormAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return null;
  }
  const { data: organizations } = await auth.organization.list();
  const active = organizations?.[0];
  if (!active) return null;
  return {
    userId: session.user.id,
    org: await ensureOrganization(active.id, active.name),
  };
}

function weekFrom(formData: FormData) {
  return normalizeContent(
    contentFromEntries(
      [...formData.entries()].filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
  );
}

export async function dietFormAction(
  _prevState: DietPlanFormState,
  formData: FormData,
): Promise<DietPlanFormState> {
  const intent = (formData.get("intent") as EditorIntent) ?? "save";
  switch (intent) {
    case "template-save":
      return saveTemplate(formData);
    case "template-load":
      return loadTemplate(formData);
    default:
      return savePlan(formData);
  }
}

async function savePlan(formData: FormData): Promise<DietPlanFormState> {
  const scope = "plan" as const;
  const title = ((formData.get("title") as string) ?? "").trim().slice(0, 120);
  const notes = ((formData.get("notes") as string) ?? "").trim().slice(0, 2000);
  // React 19 resets the form after the action even on error: echo the
  // submitted values back so the editor can re-hydrate (no data loss).
  const values = Object.fromEntries(
    [...formData.entries()]
      .filter(([k, v]) => typeof v === "string" && k !== "patientId")
      .map(([k, v]) => [k, v as string]),
  );

  const content = weekFrom(formData);
  if (!content) return { errorKey: "invalidContent", scope, values };

  const context = await specialistContext();
  if (!context) return { errorKey: "generic", scope, values };

  const patientId = (formData.get("patientId") as string) ?? "";
  const patient = await getPatientDetail(context.org.id, patientId);
  if (!patient) return { errorKey: "generic", scope, values };

  try {
    await upsertDietPlan({
      organizationId: context.org.id,
      patientId: patient.id,
      title: title || null,
      notes: notes || null,
      content,
      updatedByAuthUserId: context.userId,
    });
  } catch (error) {
    console.error("[savePlan] upsertDietPlan failed", error);
    return { errorKey: "generic", scope, values };
  }

  revalidatePath(`/panel/pacientes/${patient.id}`);
  revalidatePath(`/panel/pacientes/${patient.id}/dieta`);
  return { ok: true, scope };
}

/** Save the week currently in the editor as a reusable template. */
async function saveTemplate(formData: FormData): Promise<DietPlanFormState> {
  const scope = "template" as const;
  const name = ((formData.get("templateName") as string) ?? "")
    .trim()
    .slice(0, TEMPLATE_NAME_MAX);
  if (!name) return { errorKey: "nameRequired", scope };

  const content = weekFrom(formData);
  if (!content) return { errorKey: "invalidContent", scope };
  if (isEmptyPlan(content)) return { errorKey: "emptyPlan", scope };

  const context = await specialistContext();
  if (!context) return { errorKey: "generic", scope };

  try {
    await saveDietTemplate({
      organizationId: context.org.id,
      name,
      content,
      createdByAuthUserId: context.userId,
    });
  } catch (error) {
    console.error("[saveTemplate] save failed", error);
    return { errorKey: "generic", scope };
  }

  const patientId = (formData.get("patientId") as string) ?? "";
  revalidatePath(`/panel/pacientes/${patientId}/dieta`);
  revalidatePath("/panel/biblioteca");
  return { ok: true, scope, kind: "saved" };
}

/** Load a template into the patient's plan, overwriting the week. */
async function loadTemplate(formData: FormData): Promise<DietPlanFormState> {
  const scope = "template" as const;
  const templateId = (formData.get("templateId") as string) ?? "";
  if (!templateId) return { errorKey: "generic", scope };

  const context = await specialistContext();
  if (!context) return { errorKey: "generic", scope };

  const patientId = (formData.get("patientId") as string) ?? "";
  const patient = await getPatientDetail(context.org.id, patientId);
  if (!patient) return { errorKey: "generic", scope };

  // Org-scoped read: a template id from another consulta resolves to null.
  const template = await getDietTemplate(context.org.id, templateId);
  if (!template) return { errorKey: "notFound", scope };

  const content = normalizeContent(template.content);
  if (!content) return { errorKey: "invalidContent", scope };

  try {
    await upsertDietPlan({
      organizationId: context.org.id,
      patientId: patient.id,
      title: (formData.get("title") as string)?.trim().slice(0, 120) || null,
      notes: (formData.get("notes") as string)?.trim().slice(0, 2000) || null,
      content,
      updatedByAuthUserId: context.userId,
    });
  } catch (error) {
    console.error("[loadTemplate] upsertDietPlan failed", error);
    return { errorKey: "generic", scope };
  }

  revalidatePath(`/panel/pacientes/${patient.id}`);
  revalidatePath(`/panel/pacientes/${patient.id}/dieta`);
  return { ok: true, scope, kind: "loaded" };
}
