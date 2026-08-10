import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import type { PatientNote } from "@/generated/prisma/client";

/**
 * Specialist-private clinical notes (docs/build/slice-10-plan.md).
 * Append-only and org-scoped (LPEF Prisma R2/R4): create-only, a correction
 * is a new note. Never surfaced to the patient or the platform admin.
 */
export async function addNote(params: {
  organizationId: string;
  patientId: string;
  authorAuthUserId: string;
  body: string;
}): Promise<PatientNote> {
  const note = await prisma.patientNote.create({
    data: params,
  });

  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: params.patientId,
    type: "NoteAdded",
    payload: { noteId: note.id },
  });

  return note;
}

/** Newest first. */
export async function listNotes(
  organizationId: string,
  patientId: string,
): Promise<PatientNote[]> {
  return prisma.patientNote.findMany({
    where: { organizationId, patientId },
    orderBy: { createdAt: "desc" },
  });
}
