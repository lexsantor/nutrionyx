import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import type { PatientTarget } from "@/generated/prisma/client";

/**
 * Clinical targets (docs/build/slice-9-plan.md). Prescribed by the
 * specialist, org-scoped (LPEF Prisma R2/R4). Config, not facts - editable;
 * every change emits TargetsSet.
 */
export async function upsertTargets(params: {
  organizationId: string;
  patientId: string;
  kcalTarget: number | null;
  proteinTargetG: number | null;
  sessionsPerWeek: number | null;
}): Promise<PatientTarget> {
  const data = {
    kcalTarget: params.kcalTarget,
    proteinTargetG: params.proteinTargetG,
    sessionsPerWeek: params.sessionsPerWeek,
  };
  const target = await prisma.patientTarget.upsert({
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
    type: "TargetsSet",
    payload: data,
  });

  return target;
}

export async function getTargets(
  organizationId: string,
  patientId: string,
): Promise<PatientTarget | null> {
  return prisma.patientTarget.findFirst({
    where: { organizationId, patientId },
  });
}
