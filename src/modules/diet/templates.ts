import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import { nextCopyName } from "@/modules/templates/naming";
import type { DietTemplate, Prisma } from "@/generated/prisma/client";
import type { DietPlanContent } from "./plan";

/**
 * Reusable diet weeks (docs/build/slice-21-plan.md). Org-scoped (LPEF
 * Prisma R2/R4): a template belongs to the consulta, not to a patient, so
 * it loads into any patient of the same organization and into none of
 * another. Every query filters by organizationId.
 */

export { TEMPLATE_NAME_MAX } from "@/modules/templates/constants";

export async function listDietTemplates(
  organizationId: string,
): Promise<DietTemplate[]> {
  return prisma.dietTemplate.findMany({
    where: { organizationId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getDietTemplate(
  organizationId: string,
  id: string,
): Promise<DietTemplate | null> {
  // Scoped by construction: an id from another consulta resolves to null.
  return prisma.dietTemplate.findFirst({ where: { id, organizationId } });
}

/**
 * Save a week under a name. Re-saving the same name overwrites it, which
 * is what "guardar como plantilla" means to a specialist iterating on one.
 */
export async function saveDietTemplate(params: {
  organizationId: string;
  name: string;
  content: DietPlanContent;
  createdByAuthUserId: string;
}): Promise<DietTemplate> {
  const content = params.content as unknown as Prisma.InputJsonValue;
  const template = await prisma.dietTemplate.upsert({
    where: {
      organizationId_name: {
        organizationId: params.organizationId,
        name: params.name,
      },
    },
    create: {
      organizationId: params.organizationId,
      name: params.name,
      content,
      createdByAuthUserId: params.createdByAuthUserId,
    },
    update: { content },
  });

  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Organization",
    aggregateId: params.organizationId,
    type: "DietTemplateSaved",
    payload: { templateId: template.id, name: template.name },
  });

  return template;
}

/**
 * Rename in place. Returns null when the name is already held inside this
 * consulta: the unique index would reject it anyway, and the caller needs
 * to say so rather than surface a database error.
 */
export async function renameDietTemplate(params: {
  organizationId: string;
  id: string;
  name: string;
}): Promise<DietTemplate | null> {
  const existing = await getDietTemplate(params.organizationId, params.id);
  if (!existing) return null;
  if (existing.name === params.name) return existing;

  const clash = await prisma.dietTemplate.findFirst({
    where: { organizationId: params.organizationId, name: params.name },
  });
  if (clash) return null;

  const template = await prisma.dietTemplate.update({
    where: { id: existing.id },
    data: { name: params.name },
  });
  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Organization",
    aggregateId: params.organizationId,
    type: "DietTemplateRenamed",
    payload: { templateId: template.id, from: existing.name, to: template.name },
  });
  return template;
}

/** Copy a template under a free name (see modules/templates/naming.ts). */
export async function duplicateDietTemplate(params: {
  organizationId: string;
  id: string;
  createdByAuthUserId: string;
}): Promise<DietTemplate | null> {
  const existing = await getDietTemplate(params.organizationId, params.id);
  if (!existing) return null;

  const taken = (await listDietTemplates(params.organizationId)).map((t) => t.name);
  const template = await prisma.dietTemplate.create({
    data: {
      organizationId: params.organizationId,
      name: nextCopyName(existing.name, taken),
      content: existing.content as Prisma.InputJsonValue,
      createdByAuthUserId: params.createdByAuthUserId,
    },
  });
  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Organization",
    aggregateId: params.organizationId,
    type: "DietTemplateSaved",
    payload: { templateId: template.id, name: template.name },
  });
  return template;
}

export async function deleteDietTemplate(params: {
  organizationId: string;
  id: string;
}): Promise<boolean> {
  const existing = await getDietTemplate(params.organizationId, params.id);
  if (!existing) return false;

  await prisma.dietTemplate.delete({ where: { id: existing.id } });
  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Organization",
    aggregateId: params.organizationId,
    type: "DietTemplateDeleted",
    payload: { templateId: existing.id, name: existing.name },
  });
  return true;
}
