import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import type { Measurement } from "@/generated/prisma/client";

/**
 * Weight log (docs/build/slice-2-plan.md; docs/09 Measurement). Append-only
 * and org-scoped (LPEF Prisma R2/R4): create-only, every query filtered by
 * organizationId sourced from the caller's session, WeightRecorded emitted
 * per record. A correction is a new row - measurements are never updated
 * or deleted (PRD_03 rules 5-6).
 */
export async function recordWeight(params: {
  organizationId: string;
  patientId: string;
  valueKg: number;
  recordedAt?: Date;
}): Promise<Measurement> {
  const measurement = await prisma.measurement.create({
    data: {
      organizationId: params.organizationId,
      patientId: params.patientId,
      kind: "WEIGHT",
      value: params.valueKg,
      recordedAt: params.recordedAt ?? new Date(),
    },
  });

  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: params.patientId,
    type: "WeightRecorded",
    payload: { measurementId: measurement.id, valueKg: params.valueKg },
  });

  return measurement;
}

export async function listWeights(
  organizationId: string,
  patientId: string,
): Promise<Measurement[]> {
  return prisma.measurement.findMany({
    where: { organizationId, patientId, kind: "WEIGHT" },
    orderBy: { recordedAt: "asc" },
  });
}

/** Latest weight per patient in the org, for the nutritionist panel. */
export async function latestWeightByPatient(
  organizationId: string,
): Promise<Map<string, Measurement>> {
  const rows = await prisma.measurement.findMany({
    where: { organizationId, kind: "WEIGHT" },
    orderBy: { recordedAt: "desc" },
  });
  const latest = new Map<string, Measurement>();
  for (const row of rows) {
    if (!latest.has(row.patientId)) latest.set(row.patientId, row);
  }
  return latest;
}
