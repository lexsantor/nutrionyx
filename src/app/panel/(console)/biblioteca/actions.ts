"use server";

import { revalidatePath } from "next/cache";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { TEMPLATE_NAME_MAX } from "@/components/template-bar";
import {
  deleteDietTemplate,
  duplicateDietTemplate,
  renameDietTemplate,
} from "@/modules/diet/templates";
import {
  deleteTrainingTemplate,
  duplicateTrainingTemplate,
  renameTrainingTemplate,
} from "@/modules/training/templates";

/**
 * Library actions (docs/build/navigation-audit.md, tier 1). Diet and
 * training templates are the same object in two tables, so one `kind`
 * field routes to the right repository instead of duplicating three
 * actions per kind.
 */
export type LibraryFormState = { errorKey: string } | { ok: true } | null;

export type TemplateKind = "diet" | "training";

function readKind(formData: FormData): TemplateKind | null {
  const kind = formData.get("kind");
  return kind === "diet" || kind === "training" ? kind : null;
}

export async function renameTemplateAction(
  _prevState: LibraryFormState,
  formData: FormData,
): Promise<LibraryFormState> {
  const kind = readKind(formData);
  const id = (formData.get("id") as string) ?? "";
  const name = ((formData.get("name") as string) ?? "")
    .trim()
    .slice(0, TEMPLATE_NAME_MAX);
  if (!kind || !id) return { errorKey: "generic" };
  if (!name) return { errorKey: "nameRequired" };

  // Org comes from the session, never from the form: an id belonging to
  // another consulta resolves to null inside the repository.
  const { org } = await requireSpecialistOrg();
  const rename = kind === "diet" ? renameDietTemplate : renameTrainingTemplate;

  try {
    const result = await rename({ organizationId: org.id, id, name });
    if (!result) return { errorKey: "nameTaken" };
  } catch (error) {
    console.error("[renameTemplateAction] failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath("/panel/biblioteca");
  return { ok: true };
}

export async function duplicateTemplateAction(
  _prevState: LibraryFormState,
  formData: FormData,
): Promise<LibraryFormState> {
  const kind = readKind(formData);
  const id = (formData.get("id") as string) ?? "";
  if (!kind || !id) return { errorKey: "generic" };

  const { org, userId } = await requireSpecialistOrg();
  const duplicate =
    kind === "diet" ? duplicateDietTemplate : duplicateTrainingTemplate;

  try {
    const result = await duplicate({
      organizationId: org.id,
      id,
      createdByAuthUserId: userId,
    });
    if (!result) return { errorKey: "notFound" };
  } catch (error) {
    console.error("[duplicateTemplateAction] failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath("/panel/biblioteca");
  return { ok: true };
}

export async function deleteTemplateAction(
  _prevState: LibraryFormState,
  formData: FormData,
): Promise<LibraryFormState> {
  const kind = readKind(formData);
  const id = (formData.get("id") as string) ?? "";
  if (!kind || !id) return { errorKey: "generic" };

  const { org } = await requireSpecialistOrg();
  const remove = kind === "diet" ? deleteDietTemplate : deleteTrainingTemplate;

  try {
    const removed = await remove({ organizationId: org.id, id });
    if (!removed) return { errorKey: "notFound" };
  } catch (error) {
    console.error("[deleteTemplateAction] failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath("/panel/biblioteca");
  return { ok: true };
}
