"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { getPatientDetail } from "@/modules/patient/repository";
import { upsertRoutine } from "@/modules/training/repository";
import {
  isEmptyRoutine,
  normalizeRoutine,
  routineFromEntries,
} from "@/modules/training/routine";
import {
  TEMPLATE_NAME_MAX,
  getTrainingTemplate,
  saveTrainingTemplate,
} from "@/modules/training/templates";

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
  const content = normalizeRoutine(
    routineFromEntries(
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

export type TemplateFormState =
  | { errorKey: string }
  | { ok: true; kind: "saved" | "loaded" }
  | null;

/** Save the week currently in the editor as a reusable template. */
export async function saveTrainingTemplateAction(
  _prevState: TemplateFormState,
  formData: FormData,
): Promise<TemplateFormState> {
  const name = ((formData.get("templateName") as string) ?? "")
    .trim()
    .slice(0, TEMPLATE_NAME_MAX);
  if (!name) return { errorKey: "nameRequired" };

  const content = normalizeRoutine(
    routineFromEntries(
      [...formData.entries()].filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
  );
  if (!content) return { errorKey: "invalidContent" };
  if (isEmptyRoutine(content)) return { errorKey: "emptyPlan" };

  const { data: session } = await auth.getSession();
  if (!session?.user) return { errorKey: "generic" };
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[saveTrainingTemplateAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return { errorKey: "generic" };
  }
  const { data: organizations } = await auth.organization.list();
  const active = organizations?.[0];
  if (!active) return { errorKey: "generic" };
  const org = await ensureOrganization(active.id, active.name);

  try {
    await saveTrainingTemplate({
      organizationId: org.id,
      name,
      content,
      createdByAuthUserId: session.user.id,
    });
  } catch (error) {
    console.error("[saveTrainingTemplateAction] save failed", error);
    return { errorKey: "generic" };
  }

  const patientId = (formData.get("patientId") as string) ?? "";
  revalidatePath(`/panel/pacientes/${patientId}/entreno`);
  return { ok: true, kind: "saved" };
}

/** Load a template into the patient's routine, overwriting the week. */
export async function loadTrainingTemplateAction(
  _prevState: TemplateFormState,
  formData: FormData,
): Promise<TemplateFormState> {
  const templateId = (formData.get("templateId") as string) ?? "";
  if (!templateId) return { errorKey: "generic" };

  const { data: session } = await auth.getSession();
  if (!session?.user) return { errorKey: "generic" };
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[loadTrainingTemplateAction] non-nutritionist attempted", {
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
  const template = await getTrainingTemplate(org.id, templateId);
  if (!template) return { errorKey: "notFound" };

  const content = normalizeRoutine(template.content);
  if (!content) return { errorKey: "invalidContent" };

  try {
    await upsertRoutine({
      organizationId: org.id,
      patientId: patient.id,
      title: (formData.get("title") as string)?.trim().slice(0, 120) || null,
      notes: (formData.get("notes") as string)?.trim().slice(0, 2000) || null,
      content,
      updatedByAuthUserId: session.user.id,
    });
  } catch (error) {
    console.error("[loadTrainingTemplateAction] upsertRoutine failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath(`/panel/pacientes/${patient.id}`);
  revalidatePath(`/panel/pacientes/${patient.id}/entreno`);
  return { ok: true, kind: "loaded" };
}
