import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import type { Message, MessageSender } from "@/generated/prisma/client";

/**
 * Async messaging (docs/build/slice-19-plan.md). One thread per patient,
 * org-scoped (LPEF Prisma R2/R4). Messages are never edited or deleted -
 * a correction is a new message. MessageSent carries ids only.
 */
export async function sendMessage(params: {
  organizationId: string;
  patientId: string;
  sender: MessageSender;
  senderAuthUserId: string;
  body: string;
}): Promise<Message> {
  const message = await prisma.message.create({ data: params });
  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: params.patientId,
    type: "MessageSent",
    payload: { messageId: message.id, sender: params.sender },
  });
  return message;
}

/** Oldest first (chat order). */
export async function listThread(
  organizationId: string,
  patientId: string,
): Promise<Message[]> {
  return prisma.message.findMany({
    where: { organizationId, patientId },
    orderBy: { createdAt: "asc" },
  });
}

/** The reader opens the thread: counterpart messages become read. */
export async function markThreadRead(
  organizationId: string,
  patientId: string,
  reader: MessageSender,
): Promise<void> {
  await prisma.message.updateMany({
    where: {
      organizationId,
      patientId,
      sender: { not: reader },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

/** Unread messages sent by the counterpart of `reader` in one thread. */
export async function unreadCount(
  organizationId: string,
  patientId: string,
  reader: MessageSender,
): Promise<number> {
  return prisma.message.count({
    where: {
      organizationId,
      patientId,
      sender: { not: reader },
      readAt: null,
    },
  });
}

/** Unread patient-sent messages per patient, for the panel list badges. */
export async function unreadFromPatients(
  organizationId: string,
): Promise<Map<string, number>> {
  const rows = await prisma.message.groupBy({
    by: ["patientId"],
    where: { organizationId, sender: "PATIENT", readAt: null },
    _count: { id: true },
  });
  return new Map(rows.map((row) => [row.patientId, row._count.id]));
}
