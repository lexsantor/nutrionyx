import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import type {
  InjectionSite,
  MedicationDose,
  MedicationFrequency,
  MedicationPlan,
} from "@/generated/prisma/client";

/**
 * GLP-1 medication (docs/build/slice-8-plan.md). Org-scoped (LPEF Prisma
 * R2/R4): every query filters by organizationId sourced from the session.
 * The plan is patient-owned configuration; doses are append-only facts
 * (PRD_03 rules 5-6) - a correction is a new row.
 */
export async function upsertPlan(params: {
  organizationId: string;
  patientId: string;
  drugName: string;
  genericName: string | null;
  frequency: MedicationFrequency;
  doseMg: number;
  shotDay: number | null;
}): Promise<MedicationPlan> {
  const data = {
    drugName: params.drugName,
    genericName: params.genericName,
    frequency: params.frequency,
    doseMg: params.doseMg,
    shotDay: params.frequency === "WEEKLY" ? params.shotDay : null,
    active: true,
  };
  const plan = await prisma.medicationPlan.upsert({
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
    type: "MedicationPlanSet",
    payload: { planId: plan.id, drugName: plan.drugName, doseMg: params.doseMg },
  });

  return plan;
}

export async function getPlan(
  organizationId: string,
  patientId: string,
): Promise<MedicationPlan | null> {
  return prisma.medicationPlan.findFirst({
    where: { organizationId, patientId, active: true },
  });
}

export async function logDose(params: {
  organizationId: string;
  patientId: string;
  drugName: string;
  doseMg: number;
  site: InjectionSite;
  takenAt?: Date;
}): Promise<MedicationDose> {
  const dose = await prisma.medicationDose.create({
    data: {
      organizationId: params.organizationId,
      patientId: params.patientId,
      drugName: params.drugName,
      doseMg: params.doseMg,
      site: params.site,
      takenAt: params.takenAt ?? new Date(),
    },
  });

  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: params.patientId,
    type: "MedicationDoseLogged",
    payload: { doseId: dose.id, doseMg: params.doseMg, site: params.site },
  });

  return dose;
}

/** Newest first. */
export async function listDoses(
  organizationId: string,
  patientId: string,
  limit?: number,
): Promise<MedicationDose[]> {
  return prisma.medicationDose.findMany({
    where: { organizationId, patientId },
    orderBy: { takenAt: "desc" },
    take: limit,
  });
}
