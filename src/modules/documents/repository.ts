import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import type { PatientDocument } from "@/generated/prisma/client";

/**
 * Patient-document rows (docs/build/slice-16-plan.md). DB only - blob I/O
 * lives in the routes (same split as photos, keeps integration DB-only).
 */
export async function addDocument(params: {
  organizationId: string;
  patientId: string;
  pathname: string;
  contentType: string;
  fileName: string;
  uploadedByAuthUserId: string;
}): Promise<PatientDocument> {
  const document = await prisma.patientDocument.create({ data: params });
  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: params.patientId,
    type: "DocumentAdded",
    payload: { documentId: document.id },
  });
  return document;
}

/** Newest first. */
export async function listDocuments(
  organizationId: string,
  patientId: string,
): Promise<PatientDocument[]> {
  return prisma.patientDocument.findMany({
    where: { organizationId, patientId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDocument(
  organizationId: string,
  documentId: string,
): Promise<PatientDocument | null> {
  return prisma.patientDocument.findFirst({
    where: { id: documentId, organizationId },
  });
}

/** Deletes the row; the caller deletes the blob. */
export async function deleteDocument(
  organizationId: string,
  documentId: string,
): Promise<PatientDocument | null> {
  const document = await prisma.patientDocument.findFirst({
    where: { id: documentId, organizationId },
  });
  if (!document) return null;
  await prisma.patientDocument.delete({ where: { id: document.id } });
  await appendEvent({
    organizationId,
    aggregate: "Patient",
    aggregateId: document.patientId,
    type: "DocumentDeleted",
    payload: { documentId },
  });
  return document;
}
