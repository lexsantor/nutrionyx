import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { findPatientByAuthUserId } from "@/modules/patient/repository";

export const dynamic = "force-dynamic";

/**
 * GDPR right of access (docs/build/slice-13-plan.md): the signed-in patient
 * downloads their own data as JSON. Org-scoped by construction (their own
 * patient row). Specialist notes are excluded (anotaciones subjetivas).
 */
export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    return new Response("Not found", { status: 404 });
  }

  const where = { organizationId: patient.organizationId, patientId: patient.id };
  const [assessments, measurements, plan, doses, targets, dietPlan] =
    await Promise.all([
      prisma.assessment.findMany({
        where,
        orderBy: { version: "asc" },
      }),
      prisma.measurement.findMany({ where, orderBy: { recordedAt: "asc" } }),
      prisma.medicationPlan.findFirst({ where }),
      prisma.medicationDose.findMany({ where, orderBy: { takenAt: "asc" } }),
      prisma.patientTarget.findFirst({ where }),
      prisma.dietPlan.findFirst({ where }),
    ]);
  const [trainingRoutine, trainingSessions, messages, appointments] =
    await Promise.all([
      prisma.trainingRoutine.findFirst({ where }),
      prisma.trainingSession.findMany({ where, orderBy: { sessionAt: "asc" } }),
      prisma.message.findMany({ where, orderBy: { createdAt: "asc" } }),
      prisma.appointment.findMany({ where, orderBy: { startsAt: "asc" } }),
    ]);

  const data = {
    exportedAt: new Date().toISOString(),
    patient: {
      email: patient.email,
      fullName: patient.fullName,
      status: patient.status,
      createdAt: patient.createdAt,
    },
    assessments,
    measurements: measurements.map((m) => ({
      kind: m.kind,
      value: Number(m.value),
      recordedAt: m.recordedAt,
    })),
    medicationPlan: plan,
    medicationDoses: doses.map((d) => ({
      drugName: d.drugName,
      doseMg: Number(d.doseMg),
      site: d.site,
      takenAt: d.takenAt,
    })),
    targets,
    dietPlan,
    trainingRoutine,
    trainingSessions,
    messages: messages.map((m) => ({
      sender: m.sender,
      body: m.body,
      createdAt: m.createdAt,
    })),
    appointments: appointments.map((a) => ({
      startsAt: a.startsAt,
      durationMin: a.durationMin,
      mode: a.mode,
      status: a.status,
      note: a.note,
    })),
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="nutrionyx-mis-datos.json"',
    },
  });
}
