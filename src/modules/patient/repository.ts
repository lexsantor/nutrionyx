import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import type { Patient } from "@/generated/prisma/client";

/**
 * Patient lifecycle: INVITED -> ACTIVE (docs/04 operating model).
 * All queries are organization-scoped; the organizationId comes from
 * the domain mirror row, never from client input.
 */

export async function createInvitedPatient(params: {
  organizationId: string;
  email: string;
  fullName: string;
}): Promise<Patient> {
  const patient = await prisma.patient.create({
    data: {
      organizationId: params.organizationId,
      email: params.email.toLowerCase(),
      fullName: params.fullName,
      status: "INVITED",
    },
  });

  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: patient.id,
    type: "PatientCreated",
    payload: { patientId: patient.id },
  });

  return patient;
}

export async function activatePatient(params: {
  organizationId: string;
  email: string;
  authUserId: string;
}): Promise<Patient | null> {
  const patient = await prisma.patient.findUnique({
    where: {
      organizationId_email: {
        organizationId: params.organizationId,
        email: params.email.toLowerCase(),
      },
    },
  });

  if (!patient) return null;

  return prisma.patient.update({
    where: { id: patient.id },
    data: { authUserId: params.authUserId, status: "ACTIVE" },
  });
}

/**
 * Removes a never-activated patient (INVITED only) so the email can be
 * re-invited. Active patients are never deleted through this path.
 * The append-only event log keeps the full history (C5).
 */
export async function removeInvitedPatient(params: {
  organizationId: string;
  email: string;
}): Promise<boolean> {
  const patient = await findPatientByEmail(
    params.organizationId,
    params.email,
  );
  if (!patient || patient.status !== "INVITED") return false;

  await prisma.patient.delete({ where: { id: patient.id } });

  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: patient.id,
    type: "PatientInvitationCancelled",
    payload: {},
  });

  return true;
}

export async function listPatients(organizationId: string): Promise<Patient[]> {
  return prisma.patient.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

/** Panel view: each patient with their latest assessment, org-scoped. */
export async function listPatientsWithLatestAssessment(organizationId: string) {
  return prisma.patient.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      assessments: { orderBy: { version: "desc" }, take: 1 },
    },
  });
}

/**
 * Patient detail (read-only clinical view, docs/build/slice-7-plan.md), with
 * the latest assessment. Org-scoped: the patient id is matched together with
 * the organizationId from the session, so a specialist can never open another
 * consulta's patient by guessing the id. Returns null when out of scope.
 */
export async function getPatientDetail(
  organizationId: string,
  patientId: string,
) {
  return prisma.patient.findFirst({
    where: { id: patientId, organizationId },
    include: {
      assessments: { orderBy: { version: "desc" }, take: 1 },
    },
  });
}

export async function findPatientByAuthUserId(
  authUserId: string,
): Promise<Patient | null> {
  return prisma.patient.findUnique({ where: { authUserId } });
}

export async function findPatientByEmail(
  organizationId: string,
  email: string,
): Promise<Patient | null> {
  return prisma.patient.findUnique({
    where: {
      organizationId_email: { organizationId, email: email.toLowerCase() },
    },
  });
}

/**
 * GDPR erasure via anonymization (docs/build/slice-13-plan.md). Children are
 * hard-deleted (erasure trumps append-only); the Patient row becomes a
 * PII-free tombstone. The row is kept - and keeps authUserId - because
 * resolveUserRole treats "no Patient row" as nutritionist, so a full delete
 * would resolve an erased patient's login into the consulta's panel.
 */
export async function erasePatient(
  organizationId: string,
  patientId: string,
): Promise<{ ok: boolean; photoPathnames: string[] }> {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, organizationId },
  });
  if (!patient) return { ok: false, photoPathnames: [] };

  const scope = { organizationId, patientId };
  const photoRows = await prisma.patientPhoto.findMany({
    where: scope,
    select: { pathname: true },
  });
  const documentRows = await prisma.patientDocument.findMany({
    where: scope,
    select: { pathname: true },
  });
  const counts = await prisma.$transaction(async (tx) => {
    const appointments = await tx.appointment.deleteMany({ where: scope });
    const messages = await tx.message.deleteMany({ where: scope });
    const sessions = await tx.trainingSession.deleteMany({ where: scope });
    const routines = await tx.trainingRoutine.deleteMany({ where: scope });
    const dietPlans = await tx.dietPlan.deleteMany({ where: scope });
    const documents = await tx.patientDocument.deleteMany({ where: scope });
    const photos = await tx.patientPhoto.deleteMany({ where: scope });
    const doses = await tx.medicationDose.deleteMany({ where: scope });
    const plans = await tx.medicationPlan.deleteMany({ where: scope });
    const targets = await tx.patientTarget.deleteMany({ where: scope });
    const notes = await tx.patientNote.deleteMany({ where: scope });
    const measurements = await tx.measurement.deleteMany({ where: scope });
    // Null the version links first: the self-FK would reject an arbitrary
    // deletion order inside deleteMany.
    await tx.assessment.updateMany({
      where: scope,
      data: { predecessorId: null },
    });
    const assessments = await tx.assessment.deleteMany({ where: scope });
    await tx.domainEvent.deleteMany({
      where: { organizationId, aggregate: "Patient", aggregateId: patientId },
    });
    await tx.patient.update({
      where: { id: patientId },
      data: {
        email: `erased-${patientId}@anonimizado.invalid`,
        fullName: null,
      },
    });
    return {
      doses: doses.count,
      plans: plans.count,
      targets: targets.count,
      notes: notes.count,
      measurements: measurements.count,
      assessments: assessments.count,
      photos: photos.count,
      documents: documents.count,
      dietPlans: dietPlans.count,
      routines: routines.count,
      sessions: sessions.count,
      messages: messages.count,
      appointments: appointments.count,
    };
  });

  await appendEvent({
    organizationId,
    aggregate: "Organization",
    aggregateId: organizationId,
    type: "PatientErased",
    payload: counts,
  });

  return {
    ok: true,
    photoPathnames: [
      ...photoRows.map((p) => p.pathname),
      ...documentRows.map((d) => d.pathname),
    ],
  };
}
