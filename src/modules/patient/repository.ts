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

export async function listPatients(organizationId: string): Promise<Patient[]> {
  return prisma.patient.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
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
