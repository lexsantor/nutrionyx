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
import type { EditorIntent } from "@/components/template-bar";
import type { Organization } from "@/generated/prisma/client";

/**
 * One action for the whole editor form, branching on the `intent` carried
 * by whichever submit button was pressed.
 *
 * They used to be three actions reached through formAction on the buttons.
 * That worked; it just put two action descriptors in one payload for no
 * benefit. (The bug that sent me looking was elsewhere: see
 * modules/templates/constants.ts.)
 */
export type RoutineFormState =
  | { errorKey: string; scope: Scope; values?: Record<string, string> }
  | { ok: true; scope: Scope; kind?: "saved" | "loaded"; values?: Record<string, string> }
  | null;

type Scope = "routine" | "template";

/** Session -> role -> org, shared by all three branches. */
async function specialistContext(): Promise<
  { userId: string; org: Organization } | null
> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[routineFormAction] non-nutritionist attempted", {
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

/**
 * The submitted text, echoed back to the editor.
 *
 * React 19 resets the form once an action resolves, and the editors keep
 * their cells as uncontrolled inputs, so without this every typed amount,
 * food, series and repetition is blanked on screen the moment any action
 * succeeds. Saving a week as a template then left the editor looking empty
 * and the next "guardar" wrote that emptiness over the real plan.
 */
function echo(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    [...formData.entries()]
      .filter(([k, v]) => typeof v === "string" && k !== "patientId")
      .map(([k, v]) => [k, v as string]),
  );
}

function weekFrom(formData: FormData) {
  return normalizeRoutine(
    routineFromEntries(
      [...formData.entries()].filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
  );
}

export async function routineFormAction(
  _prevState: RoutineFormState,
  formData: FormData,
): Promise<RoutineFormState> {
  const intent = (formData.get("intent") as EditorIntent) ?? "save";
  switch (intent) {
    case "template-save":
      return saveTemplate(formData);
    case "template-load":
      return loadTemplate(formData);
    default:
      return saveRoutine(formData);
  }
}

async function saveRoutine(formData: FormData): Promise<RoutineFormState> {
  const scope = "routine" as const;
  const title = ((formData.get("title") as string) ?? "").trim().slice(0, 120);
  const notes = ((formData.get("notes") as string) ?? "").trim().slice(0, 2000);
  const values = echo(formData);

  const content = weekFrom(formData);
  if (!content) return { errorKey: "invalidContent", scope, values };

  const context = await specialistContext();
  if (!context) return { errorKey: "generic", scope, values };

  const patientId = (formData.get("patientId") as string) ?? "";
  const patient = await getPatientDetail(context.org.id, patientId);
  if (!patient) return { errorKey: "generic", scope, values };

  try {
    await upsertRoutine({
      organizationId: context.org.id,
      patientId: patient.id,
      title: title || null,
      notes: notes || null,
      content,
      updatedByAuthUserId: context.userId,
    });
  } catch (error) {
    console.error("[saveRoutine] upsertRoutine failed", error);
    return { errorKey: "generic", scope, values };
  }

  revalidatePath(`/panel/pacientes/${patient.id}`);
  revalidatePath(`/panel/pacientes/${patient.id}/entreno`);
  return { ok: true, scope, values };
}

/** Save the week currently in the editor as a reusable template. */
async function saveTemplate(formData: FormData): Promise<RoutineFormState> {
  const scope = "template" as const;
  // Emptiness is decided before the cap is applied: a broken cap should
  // yield a wrong length, never a phantom "name required" (see
  // modules/templates/constants.ts).
  const typed = ((formData.get("templateName") as string) ?? "").trim();
  if (!typed) return { errorKey: "nameRequired", scope };
  const name = typed.slice(0, TEMPLATE_NAME_MAX);

  const content = weekFrom(formData);
  if (!content) return { errorKey: "invalidContent", scope };
  if (isEmptyRoutine(content)) return { errorKey: "emptyPlan", scope };

  const context = await specialistContext();
  if (!context) return { errorKey: "generic", scope };

  try {
    await saveTrainingTemplate({
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
  revalidatePath(`/panel/pacientes/${patientId}/entreno`);
  revalidatePath("/panel/biblioteca");
  return { ok: true, scope, kind: "saved", values: echo(formData) };
}

/** Load a template into the patient's routine, overwriting the week. */
async function loadTemplate(formData: FormData): Promise<RoutineFormState> {
  const scope = "template" as const;
  const templateId = (formData.get("templateId") as string) ?? "";
  if (!templateId) return { errorKey: "generic", scope };

  const context = await specialistContext();
  if (!context) return { errorKey: "generic", scope };

  const patientId = (formData.get("patientId") as string) ?? "";
  const patient = await getPatientDetail(context.org.id, patientId);
  if (!patient) return { errorKey: "generic", scope };

  // Org-scoped read: a template id from another consulta resolves to null.
  const template = await getTrainingTemplate(context.org.id, templateId);
  if (!template) return { errorKey: "notFound", scope };

  const content = normalizeRoutine(template.content);
  if (!content) return { errorKey: "invalidContent", scope };

  try {
    await upsertRoutine({
      organizationId: context.org.id,
      patientId: patient.id,
      title: (formData.get("title") as string)?.trim().slice(0, 120) || null,
      notes: (formData.get("notes") as string)?.trim().slice(0, 2000) || null,
      content,
      updatedByAuthUserId: context.userId,
    });
  } catch (error) {
    console.error("[loadTemplate] upsertRoutine failed", error);
    return { errorKey: "generic", scope };
  }

  revalidatePath(`/panel/pacientes/${patient.id}`);
  revalidatePath(`/panel/pacientes/${patient.id}/entreno`);
  return { ok: true, scope, kind: "loaded" };
}
