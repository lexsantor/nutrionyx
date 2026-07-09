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
    payload: { email: patient.email },
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
    payload: { email: patient.email },
  });

  return true;
}

export async function listPatients(organizationId: string): Promise<Patient[]> {
  return prisma.patient.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
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
