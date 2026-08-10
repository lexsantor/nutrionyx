import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import type { DietPlan, Prisma } from "@/generated/prisma/client";
import type { DietPlanContent } from "./plan";

/**
 * Diet Plan aggregate (docs/build/slice-17-plan.md). Org-scoped (LPEF
 * Prisma R2/R4); editable config with edit history via DietPlanSaved.
 */
export async function upsertDietPlan(params: {
  organizationId: string;
  patientId: string;
  title: string | null;
  notes: string | null;
  content: DietPlanContent;
  updatedByAuthUserId: string;
}): Promise<DietPlan> {
  const data = {
    title: params.title,
    notes: params.notes,
    content: params.content as unknown as Prisma.InputJsonValue,
    updatedByAuthUserId: params.updatedByAuthUserId,
  };
  const plan = await prisma.dietPlan.upsert({
    where: { patientId: params.patientId },
    create: {
      organizationId: params.organizationId,
      patientId: params.patientId,
      ...data,
    },
    update: data,
  });

  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: params.patientId,
    type: "DietPlanSaved",
    payload: { dietPlanId: plan.id },
  });

  return plan;
}

export async function getDietPlan(
  organizationId: string,
  patientId: string,
): Promise<DietPlan | null> {
  return prisma.dietPlan.findFirst({
    where: { organizationId, patientId },
  });
}
