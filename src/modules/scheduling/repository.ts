import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import type {
  Appointment,
  AppointmentMode,
} from "@/generated/prisma/client";

/**
 * Appointments (docs/build/slice-20-plan.md). Org-scoped (LPEF Prisma
 * R2/R4); cancelled rows are kept for history.
 */
export async function createAppointment(params: {
  organizationId: string;
  patientId: string;
  startsAt: Date;
  durationMin: number;
  mode: AppointmentMode;
  videoUrl: string | null;
  note: string | null;
  createdByAuthUserId: string;
}): Promise<Appointment> {
  const appointment = await prisma.appointment.create({ data: params });
  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: params.patientId,
    type: "AppointmentScheduled",
    payload: { appointmentId: appointment.id },
  });
  return appointment;
}

/** Org-scoped guard in the WHERE; returns false when nothing matched. */
export async function cancelAppointment(
  organizationId: string,
  appointmentId: string,
): Promise<boolean> {
  const result = await prisma.appointment.updateMany({
    where: { id: appointmentId, organizationId, status: "SCHEDULED" },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  if (result.count === 0) return false;

  const row = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
  });
  await appendEvent({
    organizationId,
    aggregate: "Patient",
    aggregateId: row.patientId,
    type: "AppointmentCancelled",
    payload: { appointmentId },
  });
  return true;
}

export type AgendaItem = Appointment & {
  patient: { fullName: string | null; email: string };
};

/** Upcoming scheduled citas for the whole consulta, soonest first. */
export async function listUpcomingByOrg(
  organizationId: string,
  from: Date,
): Promise<AgendaItem[]> {
  return prisma.appointment.findMany({
    where: { organizationId, status: "SCHEDULED", startsAt: { gte: from } },
    orderBy: { startsAt: "asc" },
    include: { patient: { select: { fullName: true, email: true } } },
  });
}

/** Upcoming scheduled citas for one patient, soonest first. */
export async function listUpcomingByPatient(
  organizationId: string,
  patientId: string,
  from: Date,
): Promise<Appointment[]> {
  return prisma.appointment.findMany({
    where: {
      organizationId,
      patientId,
      status: "SCHEDULED",
      startsAt: { gte: from },
    },
    orderBy: { startsAt: "asc" },
  });
}

/**
 * Scheduled citas inside [start, end) with an ACTIVE patient. Cross-org by
 * design: consumed only by the reminder cron.
 */
export async function appointmentsBetween(
  start: Date,
  end: Date,
): Promise<AgendaItem[]> {
  return prisma.appointment.findMany({
    where: {
      status: "SCHEDULED",
      startsAt: { gte: start, lt: end },
      patient: { status: "ACTIVE" },
    },
    orderBy: { startsAt: "asc" },
    include: { patient: { select: { fullName: true, email: true } } },
  });
}
