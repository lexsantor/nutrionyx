import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import { bmi, targetDeltaRatio } from "./computed";
import {
  missingRequiredFields,
  type AssessmentField,
} from "./definition";
import type { Assessment } from "@/generated/prisma/client";

/**
 * Assessment aggregate persistence (docs/09_Domain_Model.md):
 * IN_PROGRESS -> COMPLETED, completed versions are immutable,
 * repeats create a new version chained via predecessorId.
 */

export async function findLatestAssessment(
  patientId: string,
): Promise<Assessment | null> {
  return prisma.assessment.findFirst({
    where: { patientId },
    orderBy: { version: "desc" },
  });
}

export async function getOrCreateInProgressAssessment(params: {
  organizationId: string;
  patientId: string;
}): Promise<Assessment> {
  const latest = await findLatestAssessment(params.patientId);

  if (latest && latest.status === "IN_PROGRESS") {
    return latest;
  }

  const assessment = await prisma.assessment.create({
    data: {
      organizationId: params.organizationId,
      patientId: params.patientId,
      status: "IN_PROGRESS",
      version: (latest?.version ?? 0) + 1,
      predecessorId: latest?.id ?? null,
      goals: [],
    },
  });

  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Assessment",
    aggregateId: assessment.id,
    type: "AssessmentStarted",
    payload: { version: assessment.version },
  });

  return assessment;
}

export async function saveAnswer(params: {
  assessmentId: string;
  organizationId: string;
  field: AssessmentField;
  value: string | number | string[];
}): Promise<{ ok: boolean }> {
  // Immutability guard: answers only land on IN_PROGRESS rows.
  // updateMany carries the status + org in the WHERE clause, so a
  // completed or foreign assessment is a no-op, not an overwrite.
  const data =
    params.field === "birthDate"
      ? { birthDate: new Date(`${params.value}T00:00:00Z`) }
      : { [params.field]: params.value };

  const result = await prisma.assessment.updateMany({
    where: {
      id: params.assessmentId,
      organizationId: params.organizationId,
      status: "IN_PROGRESS",
    },
    data,
  });

  return { ok: result.count === 1 };
}

export type CompletionResult =
  | { ok: true; assessment: Assessment }
  | { ok: false; missing: AssessmentField[] }
  | { ok: false; missing: null };

export async function completeAssessment(params: {
  assessmentId: string;
  organizationId: string;
}): Promise<CompletionResult> {
  const assessment = await prisma.assessment.findFirst({
    where: { id: params.assessmentId, organizationId: params.organizationId },
  });

  if (!assessment || assessment.status !== "IN_PROGRESS") {
    return { ok: false, missing: null };
  }

  const missing = missingRequiredFields({
    sex: assessment.sex,
    birthDate: assessment.birthDate,
    heightCm: assessment.heightCm,
    weightKg: assessment.weightKg,
    targetWeightKg: assessment.targetWeightKg,
    activityLevel: assessment.activityLevel,
    goals: assessment.goals,
  });

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  const heightCm = Number(assessment.heightCm);
  const weightKg = Number(assessment.weightKg);
  const targetWeightKg = Number(assessment.targetWeightKg);

  const completed = await prisma.assessment.update({
    where: { id: assessment.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      bmi: bmi(weightKg, heightCm),
      targetDeltaRatio:
        Math.round(targetDeltaRatio(weightKg, targetWeightKg) * 10000) / 10000,
    },
  });

  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Assessment",
    aggregateId: completed.id,
    type: "AssessmentCompleted",
    payload: { version: completed.version, bmi: Number(completed.bmi) },
  });

  return { ok: true, assessment: completed };
}
