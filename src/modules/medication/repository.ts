import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import { madridDayStart } from "@/modules/scheduling/time";
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
    payload: { planId: plan.id },
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

/**
 * The specialist's view of the plan, which exists only while the patient
 * shares it (owner decision 2026-08-13). The filter lives here rather than in
 * the page so every future caller inherits it: a console screen that forgets
 * to check the flag would leak the drug name, which is the sensitive part.
 *
 * Returns null, never a "shares nothing" marker. Telling a specialist that a
 * patient follows an undisclosed medication discloses the medication.
 */
export async function getPlanForSpecialist(
  organizationId: string,
  patientId: string,
): Promise<MedicationPlan | null> {
  return prisma.medicationPlan.findFirst({
    where: {
      organizationId,
      patientId,
      active: true,
      sharedWithSpecialist: true,
    },
  });
}

/** Doses only while the plan behind them is shared. Same reasoning. */
export async function listDosesForSpecialist(
  organizationId: string,
  patientId: string,
  take?: number,
): Promise<MedicationDose[]> {
  const shared = await prisma.medicationPlan.findFirst({
    where: { organizationId, patientId, sharedWithSpecialist: true },
    select: { id: true },
  });
  if (!shared) return [];
  return listDoses(organizationId, patientId, take);
}

/**
 * The patient turns sharing on or off. The event carries the plan id and the
 * new state, never the drug: `modules/events.test.ts` fails otherwise.
 */
export async function setSharing(
  organizationId: string,
  patientId: string,
  shared: boolean,
): Promise<void> {
  const plan = await prisma.medicationPlan.findFirst({
    where: { organizationId, patientId },
    select: { id: true },
  });
  if (!plan) return;
  await prisma.medicationPlan.update({
    where: { id: plan.id },
    data: { sharedWithSpecialist: shared },
  });
  await appendEvent({
    organizationId,
    aggregate: "Patient",
    aggregateId: patientId,
    type: shared ? "MedicationSharingEnabled" : "MedicationSharingDisabled",
    payload: { planId: plan.id },
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
    payload: { doseId: dose.id },
  });

  return dose;
}

/**
 * Weekly plans whose shot day is `dayOfWeek` and whose ACTIVE patient has
 * not logged a dose on `now`'s calendar day. Cross-org by design: consumed
 * only by the reminder cron (system automation, one email per patient) -
 * never by a user-facing surface.
 */
export async function plansDueOn(
  dayOfWeek: number,
  now: Date,
): Promise<
  { organizationId: string; patientId: string; email: string; fullName: string | null }[]
> {
  const plans = await prisma.medicationPlan.findMany({
    where: {
      active: true,
      frequency: "WEEKLY",
      shotDay: dayOfWeek,
      patient: { status: "ACTIVE" },
    },
    include: { patient: { select: { email: true, fullName: true } } },
  });
  if (plans.length === 0) return [];

  const start = madridDayStart(0, now);
  const end = new Date(start.getTime() + 86_400_000);
  const dosedToday = await prisma.medicationDose.findMany({
    where: {
      patientId: { in: plans.map((p) => p.patientId) },
      takenAt: { gte: start, lt: end },
    },
    select: { patientId: true },
  });
  const dosed = new Set(dosedToday.map((d) => d.patientId));

  return plans
    .filter((p) => !dosed.has(p.patientId))
    .map((p) => ({
      organizationId: p.organizationId,
      patientId: p.patientId,
      email: p.patient.email,
      fullName: p.patient.fullName,
    }));
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
