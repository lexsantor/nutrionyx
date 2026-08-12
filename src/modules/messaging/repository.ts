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

export type InboxThread = {
  patientId: string;
  unread: number;
  last: Pick<Message, "body" | "sender" | "createdAt">;
};

/**
 * Every thread with activity, for the console inbox
 * (docs/build/navigation-audit.md, tier 1). Unread first, then by recency,
 * because "who is waiting on me" is the question the page answers.
 *
 * Two queries plus the unread counts, bounded by the number of patients
 * who have ever written rather than by the message count.
 */
export async function listInbox(
  organizationId: string,
): Promise<InboxThread[]> {
  const latest = await prisma.message.groupBy({
    by: ["patientId"],
    where: { organizationId },
    _max: { createdAt: true },
  });
  if (latest.length === 0) return [];

  const messages = await prisma.message.findMany({
    where: {
      organizationId,
      OR: latest
        .filter((row) => row._max.createdAt !== null)
        .map((row) => ({
          patientId: row.patientId,
          createdAt: row._max.createdAt!,
        })),
    },
    select: { patientId: true, body: true, sender: true, createdAt: true },
  });

  // Two messages in the same thread can share a timestamp; keep one.
  const byPatient = new Map<string, (typeof messages)[number]>();
  for (const message of messages) {
    const kept = byPatient.get(message.patientId);
    if (!kept || message.createdAt > kept.createdAt) {
      byPatient.set(message.patientId, message);
    }
  }

  const unread = await unreadFromPatients(organizationId);
  return [...byPatient.values()]
    .map((last) => ({
      patientId: last.patientId,
      unread: unread.get(last.patientId) ?? 0,
      last,
    }))
    .sort(
      (a, b) =>
        Number(b.unread > 0) - Number(a.unread > 0) ||
        b.last.createdAt.getTime() - a.last.createdAt.getTime(),
    );
}
