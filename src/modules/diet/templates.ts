import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import type { DietTemplate, Prisma } from "@/generated/prisma/client";
import type { DietPlanContent } from "./plan";

/**
 * Reusable diet weeks (docs/build/slice-21-plan.md). Org-scoped (LPEF
 * Prisma R2/R4): a template belongs to the consulta, not to a patient, so
 * it loads into any patient of the same organization and into none of
 * another. Every query filters by organizationId.
 */

export { TEMPLATE_NAME_MAX } from "@/components/template-bar";

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
