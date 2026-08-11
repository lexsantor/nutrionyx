import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import { madridDayStart } from "@/modules/scheduling/time";
import type {
  Measurement,
  MeasurementKind,
} from "@/generated/prisma/client";

/**
 * Weight log (docs/build/slice-2-plan.md; docs/09 Measurement). Append-only
 * and org-scoped (LPEF Prisma R2/R4): create-only, every query filtered by
 * organizationId sourced from the caller's session, WeightRecorded emitted
 * per record. A correction is a new row - measurements are never updated
 * or deleted (PRD_03 rules 5-6).
 */
const EVENT_BY_KIND: Record<MeasurementKind, string> = {
  WEIGHT: "WeightRecorded",
  PROTEIN: "ProteinRecorded",
  WAIST_CM: "BodyMetricRecorded",
  HIP_CM: "BodyMetricRecorded",
  BODY_FAT_PCT: "BodyMetricRecorded",
  CHEST_CM: "BodyMetricRecorded",
  ARM_CM: "BodyMetricRecorded",
  THIGH_CM: "BodyMetricRecorded",
  GLUTE_CM: "BodyMetricRecorded",
  CALF_CM: "BodyMetricRecorded",
};

/** Generic append-only metric writer; every kind routes through here. */
export async function recordMetric(params: {
  organizationId: string;
  patientId: string;
  kind: MeasurementKind;
  value: number;
  recordedAt?: Date;
}): Promise<Measurement> {
  const measurement = await prisma.measurement.create({
    data: {
      organizationId: params.organizationId,
      patientId: params.patientId,
      kind: params.kind,
      value: params.value,
      recordedAt: params.recordedAt ?? new Date(),
    },
  });

  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: params.patientId,
    type: EVENT_BY_KIND[params.kind],
    payload: {
      measurementId: measurement.id,
      kind: params.kind,
      value: params.value,
    },
  });

  return measurement;
}

/** Latest measurement of a kind for a patient, or null. */
export async function latestOfKind(
  organizationId: string,
  patientId: string,
  kind: MeasurementKind,
): Promise<Measurement | null> {
  return prisma.measurement.findFirst({
    where: { organizationId, patientId, kind },
    orderBy: { recordedAt: "desc" },
  });
}

export async function recordWeight(params: {
  organizationId: string;
  patientId: string;
  valueKg: number;
  recordedAt?: Date;
}): Promise<Measurement> {
  return recordMetric({
    organizationId: params.organizationId,
    patientId: params.patientId,
    kind: "WEIGHT",
    value: params.valueKg,
    recordedAt: params.recordedAt,
  });
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
  return recordMetric({
    organizationId: params.organizationId,
    patientId: params.patientId,
    kind: "PROTEIN",
    value: params.grams,
    recordedAt: params.recordedAt,
  });
}

/** Total protein grams recorded on the calendar day of `day` (local time). */
export async function proteinOnDay(
  organizationId: string,
  patientId: string,
  day: Date,
): Promise<number> {
  const start = madridDayStart(0, day);
  const end = new Date(start.getTime() + 86_400_000);
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

/** Measurements since `since`, ascending; omit `kind` for every kind. */
export async function listMeasurementsSince(
  organizationId: string,
  patientId: string,
  since: Date,
  kind?: MeasurementKind,
): Promise<Measurement[]> {
  return prisma.measurement.findMany({
    where: {
      organizationId,
      patientId,
      ...(kind ? { kind } : {}),
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: "asc" },
  });
}

export type BodyComposition = {
  waistCm: number | null;
  hipCm: number | null;
  bodyFatPct: number | null;
  weightKg: number | null;
  updatedAt: Date | null;
};

/** Latest body metrics + weight for derivations; updatedAt is the newest. */
export async function bodyComposition(
  organizationId: string,
  patientId: string,
): Promise<BodyComposition> {
  const [waist, hip, fat, weight] = await Promise.all([
    latestOfKind(organizationId, patientId, "WAIST_CM"),
    latestOfKind(organizationId, patientId, "HIP_CM"),
    latestOfKind(organizationId, patientId, "BODY_FAT_PCT"),
    latestOfKind(organizationId, patientId, "WEIGHT"),
  ]);
  const dates = [waist, hip, fat]
    .filter((m) => m != null)
    .map((m) => m.recordedAt.getTime());
  return {
    waistCm: waist != null ? Number(waist.value) : null,
    hipCm: hip != null ? Number(hip.value) : null,
    bodyFatPct: fat != null ? Number(fat.value) : null,
    weightKg: weight != null ? Number(weight.value) : null,
    updatedAt: dates.length > 0 ? new Date(Math.max(...dates)) : null,
  };
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
