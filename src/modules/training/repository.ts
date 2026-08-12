import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import { madridDayStart } from "@/modules/scheduling/time";
import type {
  Prisma,
  TrainingRoutine,
  TrainingSession,
} from "@/generated/prisma/client";
import type { RoutineContent } from "./routine";

/**
 * Training (docs/build/slice-18-plan.md). Routine = editable config;
 * sessions = append-only facts, one per calendar day. Org-scoped
 * (LPEF Prisma R2/R4).
 */
export async function upsertRoutine(params: {
  organizationId: string;
  patientId: string;
  title: string | null;
  notes: string | null;
  content: RoutineContent;
  updatedByAuthUserId: string;
}): Promise<TrainingRoutine> {
  const data = {
    title: params.title,
    notes: params.notes,
    content: params.content as unknown as Prisma.InputJsonValue,
    updatedByAuthUserId: params.updatedByAuthUserId,
  };
  const routine = await prisma.trainingRoutine.upsert({
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
    type: "RoutineSaved",
    payload: { routineId: routine.id },
  });

  return routine;
}

export async function getRoutine(
  organizationId: string,
  patientId: string,
): Promise<TrainingRoutine | null> {
  return prisma.trainingRoutine.findFirst({
    where: { organizationId, patientId },
  });
}

/** One session per local calendar day; returns null when today exists. */
export async function logSession(params: {
  organizationId: string;
  patientId: string;
  note: string | null;
  now?: Date;
}): Promise<TrainingSession | null> {
  const now = params.now ?? new Date();
  const start = madridDayStart(0, now);
  const end = new Date(start.getTime() + 86_400_000);

  const existing = await prisma.trainingSession.findFirst({
    where: {
      organizationId: params.organizationId,
      patientId: params.patientId,
      sessionAt: { gte: start, lt: end },
    },
  });
  if (existing) return null;

  const session = await prisma.trainingSession.create({
    data: {
      organizationId: params.organizationId,
      patientId: params.patientId,
      note: params.note,
      sessionAt: now,
    },
  });

  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: params.patientId,
    type: "SessionLogged",
    payload: { sessionId: session.id },
  });

  return session;
}

/** Newest first. */
export async function listSessions(
  organizationId: string,
  patientId: string,
  limit?: number,
): Promise<TrainingSession[]> {
  return prisma.trainingSession.findMany({
    where: { organizationId, patientId },
    orderBy: { sessionAt: "desc" },
    take: limit,
  });
}
