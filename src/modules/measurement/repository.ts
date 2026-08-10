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

/**
 * Protein intake (docs/build/slice-9-plan.md): grams per entry, several
 * entries per day sum up. Append-only like every Measurement.
 */
export async function recordProtein(params: {
  organizationId: string;
  patientId: string;
  grams: number;
  recordedAt?: Date;
}): Promise<Measurement> {
  const measurement = await prisma.measurement.create({
    data: {
      organizationId: params.organizationId,
      patientId: params.patientId,
      kind: "PROTEIN",
      value: params.grams,
      recordedAt: params.recordedAt ?? new Date(),
    },
  });

  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: params.patientId,
    type: "ProteinRecorded",
    payload: { measurementId: measurement.id, grams: params.grams },
  });

  return measurement;
}

/** Total protein grams recorded on the calendar day of `day` (local time). */
export async function proteinOnDay(
  organizationId: string,
  patientId: string,
  day: Date,
): Promise<number> {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const result = await prisma.measurement.aggregate({
    where: {
      organizationId,
      patientId,
      kind: "PROTEIN",
      recordedAt: { gte: start, lt: end },
    },
    _sum: { value: true },
  });
  return result._sum.value != null ? Number(result._sum.value) : 0;
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
