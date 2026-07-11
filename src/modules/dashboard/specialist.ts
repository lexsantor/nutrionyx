import { prisma } from "@/lib/prisma";

/**
 * Inicio dashboard counts for the specialist console (docs/build/slice-5-plan.md).
 * Every query is organization-scoped (LPEF Prisma R2); the organizationId comes
 * from the caller's session-derived domain mirror, never from client input.
 * Counts only - no patient rows or clinical values cross this surface.
 *
 * - activePatients: patients in the ACTIVE lifecycle state.
 * - newIn30Days: patients created in the last 30 days (any state).
 * - withCompletedAssessment: distinct patients with a COMPLETED assessment.
 * - pendingFollowUp: ACTIVE patients who completed their assessment but have
 *   logged no weight in the last 14 days - the ones a nutritionist should chase.
 */
export type SpecialistDashboard = {
  activePatients: number;
  newIn30Days: number;
  withCompletedAssessment: number;
  pendingFollowUp: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export async function specialistDashboard(
  organizationId: string,
): Promise<SpecialistDashboard> {
  const now = Date.now();
  const thirtyDaysAgo = new Date(now - 30 * DAY_MS);
  const fourteenDaysAgo = new Date(now - 14 * DAY_MS);

  const [activeRows, newIn30Days, completedRows, recentWeightRows] =
    await Promise.all([
      prisma.patient.findMany({
        where: { organizationId, status: "ACTIVE" },
        select: { id: true },
      }),
      prisma.patient.count({
        where: { organizationId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.assessment.findMany({
        where: { organizationId, status: "COMPLETED" },
        select: { patientId: true },
        distinct: ["patientId"],
      }),
      prisma.measurement.findMany({
        where: {
          organizationId,
          kind: "WEIGHT",
          recordedAt: { gte: fourteenDaysAgo },
        },
        select: { patientId: true },
        distinct: ["patientId"],
      }),
    ]);

  const completedSet = new Set(completedRows.map((r) => r.patientId));
  const recentWeightSet = new Set(recentWeightRows.map((r) => r.patientId));

  const pendingFollowUp = activeRows.filter(
    (p) => completedSet.has(p.id) && !recentWeightSet.has(p.id),
  ).length;

  return {
    activePatients: activeRows.length,
    newIn30Days,
    withCompletedAssessment: completedSet.size,
    pendingFollowUp,
  };
}
