import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import type { PatientPhoto } from "@/generated/prisma/client";

/**
 * Progress-photo rows (docs/build/slice-14-plan.md). DB only - blob I/O
 * lives in the routes, so these stay org-scoped pure data access
 * (LPEF Prisma R2/R4) and integration tests need no blob store.
 */
export async function addPhoto(params: {
  organizationId: string;
  patientId: string;
  pathname: string;
  contentType: string;
}): Promise<PatientPhoto> {
  const photo = await prisma.patientPhoto.create({ data: params });
  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: params.patientId,
    type: "PhotoAdded",
    payload: { photoId: photo.id },
  });
  return photo;
}

/** Newest first. */
export async function listPhotos(
  organizationId: string,
  patientId: string,
): Promise<PatientPhoto[]> {
  return prisma.patientPhoto.findMany({
    where: { organizationId, patientId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPhoto(
  organizationId: string,
  photoId: string,
): Promise<PatientPhoto | null> {
  return prisma.patientPhoto.findFirst({
    where: { id: photoId, organizationId },
  });
}

/** Deletes the row; the caller deletes the blob (needs the pathname). */
export async function deletePhoto(
  organizationId: string,
  patientId: string,
  photoId: string,
): Promise<PatientPhoto | null> {
  const photo = await prisma.patientPhoto.findFirst({
    where: { id: photoId, organizationId, patientId },
  });
  if (!photo) return null;
  await prisma.patientPhoto.delete({ where: { id: photo.id } });
  await appendEvent({
    organizationId,
    aggregate: "Patient",
    aggregateId: patientId,
    type: "PhotoDeleted",
    payload: { photoId },
  });
  return photo;
}
