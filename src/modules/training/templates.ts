import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import { nextCopyName } from "@/modules/templates/naming";
import type { Prisma, TrainingTemplate } from "@/generated/prisma/client";
import type { RoutineContent } from "./routine";

/**
 * Reusable training weeks (docs/build/slice-21-plan.md). Org-scoped (LPEF
 * Prisma R2/R4), mirroring diet/templates.ts: the template belongs to the
 * consulta, loads into any of its patients, and into none of another.
 */

export { TEMPLATE_NAME_MAX } from "@/components/template-bar";

export async function listTrainingTemplates(
  organizationId: string,
): Promise<TrainingTemplate[]> {
  return prisma.trainingTemplate.findMany({
    where: { organizationId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTrainingTemplate(
  organizationId: string,
  id: string,
): Promise<TrainingTemplate | null> {
  return prisma.trainingTemplate.findFirst({ where: { id, organizationId } });
}

/** Re-saving the same name overwrites it (see diet/templates.ts). */
export async function saveTrainingTemplate(params: {
  organizationId: string;
  name: string;
  content: RoutineContent;
  createdByAuthUserId: string;
}): Promise<TrainingTemplate> {
  const content = params.content as unknown as Prisma.InputJsonValue;
  const template = await prisma.trainingTemplate.upsert({
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
    type: "TrainingTemplateSaved",
    payload: { templateId: template.id, name: template.name },
  });

  return template;
}

/** Rename in place; null when the name is taken (see diet/templates.ts). */
export async function renameTrainingTemplate(params: {
  organizationId: string;
  id: string;
  name: string;
}): Promise<TrainingTemplate | null> {
  const existing = await getTrainingTemplate(params.organizationId, params.id);
  if (!existing) return null;
  if (existing.name === params.name) return existing;

  const clash = await prisma.trainingTemplate.findFirst({
    where: { organizationId: params.organizationId, name: params.name },
  });
  if (clash) return null;

  const template = await prisma.trainingTemplate.update({
    where: { id: existing.id },
    data: { name: params.name },
  });
  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Organization",
    aggregateId: params.organizationId,
    type: "TrainingTemplateRenamed",
    payload: { templateId: template.id, from: existing.name, to: template.name },
  });
  return template;
}

/** Copy under a free name (see modules/templates/naming.ts). */
export async function duplicateTrainingTemplate(params: {
  organizationId: string;
  id: string;
  createdByAuthUserId: string;
}): Promise<TrainingTemplate | null> {
  const existing = await getTrainingTemplate(params.organizationId, params.id);
  if (!existing) return null;

  const taken = (await listTrainingTemplates(params.organizationId)).map(
    (t) => t.name,
  );
  const template = await prisma.trainingTemplate.create({
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
    type: "TrainingTemplateSaved",
    payload: { templateId: template.id, name: template.name },
  });
  return template;
}

export async function deleteTrainingTemplate(params: {
  organizationId: string;
  id: string;
}): Promise<boolean> {
  const existing = await getTrainingTemplate(params.organizationId, params.id);
  if (!existing) return false;

  await prisma.trainingTemplate.delete({ where: { id: existing.id } });
  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Organization",
    aggregateId: params.organizationId,
    type: "TrainingTemplateDeleted",
    payload: { templateId: existing.id, name: existing.name },
  });
  return true;
}
