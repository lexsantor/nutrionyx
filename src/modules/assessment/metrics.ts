import { prisma } from "@/lib/prisma";

/**
 * Slice-1 success metrics (docs/discovery/assessment-slice.md):
 * - completion rate: activated patients who reached AssessmentCompleted
 *   (target >= 80%)
 * - median completion time, started -> completed (target <= 15 min)
 * Shipping the slice without measuring it would violate BU2.
 */

/** Median of a list; null for an empty list. Pure, unit-tested. */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export type SliceMetrics = {
  activePatients: number;
  patientsCompleted: number;
  completionRate: number | null;
  medianCompletionMinutes: number | null;
};

export async function computeSliceMetrics(
  organizationId: string,
): Promise<SliceMetrics> {
  const [activePatients, completedAssessments] = await Promise.all([
    prisma.patient.count({
      where: { organizationId, status: "ACTIVE" },
    }),
    prisma.assessment.findMany({
      where: { organizationId, status: "COMPLETED" },
      select: { patientId: true, startedAt: true, completedAt: true },
    }),
  ]);

  const patientsCompleted = new Set(
    completedAssessments.map((a) => a.patientId),
  ).size;

  const durationsMinutes = completedAssessments
    .filter((a) => a.completedAt !== null)
    .map((a) => (a.completedAt!.getTime() - a.startedAt.getTime()) / 60000);

  const medianMinutes = median(durationsMinutes);

  return {
    activePatients,
    patientsCompleted,
    completionRate:
      activePatients > 0
        ? Math.round((patientsCompleted / activePatients) * 100)
        : null,
    medianCompletionMinutes:
      medianMinutes === null ? null : Math.round(medianMinutes * 10) / 10,
  };
}
