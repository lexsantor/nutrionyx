import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import {
  findLatestAssessment,
  getOrCreateInProgressAssessment,
} from "@/modules/assessment/repository";
import {
  ASSESSMENT_STEPS,
  firstUnansweredStep,
  type AssessmentField,
} from "@/modules/assessment/definition";
import { bmi } from "@/modules/assessment/computed";
import { WizardStep } from "./wizard-step";
import { Review, type ReviewEntry } from "./review";
import type { Assessment } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

function answersOf(assessment: Assessment) {
  return {
    sex: assessment.sex,
    birthDate: assessment.birthDate
      ? assessment.birthDate.toISOString().slice(0, 10)
      : null,
    heightCm: assessment.heightCm ? Number(assessment.heightCm) : null,
    weightKg: assessment.weightKg ? Number(assessment.weightKg) : null,
    targetWeightKg: assessment.targetWeightKg
      ? Number(assessment.targetWeightKg)
      : null,
    activityLevel: assessment.activityLevel,
    goals: assessment.goals,
    conditions: assessment.conditions,
    allergies: assessment.allergies,
    currentMedication: assessment.currentMedication,
  } satisfies Record<AssessmentField, unknown>;
}

export default async function WizardPage({
  searchParams,
}: {
  searchParams: Promise<{ paso?: string }>;
}) {
  const { paso } = await searchParams;
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) redirect("/");

  // Completed assessments are immutable; re-assessment is a later slice.
  const latest = await findLatestAssessment(patient.id);
  if (latest && latest.status === "COMPLETED") redirect("/mi-espacio");

  const assessment =
    latest ??
    (await getOrCreateInProgressAssessment({
      organizationId: patient.organizationId,
      patientId: patient.id,
    }));

  const answers = answersOf(assessment);
  const maxReachable = firstUnansweredStep(answers);
  const requested = Number.parseInt(paso ?? "", 10);
  const stepIndex = Number.isFinite(requested)
    ? Math.max(0, Math.min(requested, maxReachable))
    : maxReachable;

  const totalSteps = ASSESSMENT_STEPS.length;

  if (stepIndex >= totalSteps) {
    const t = await getTranslations("wizard");

    const entries: ReviewEntry[] = ASSESSMENT_STEPS.map((step) => {
      const value = answers[step.field];
      let display: string | null = null;
      if (value !== null && value !== undefined && String(value).length > 0) {
        if (step.field === "sex" || step.field === "activityLevel") {
          display = t(`options.${step.field}.${value}`);
        } else if (step.field === "goals" && Array.isArray(value)) {
          display = value.map((g) => t(`options.goals.${g}`)).join(", ");
        } else {
          display = String(value);
        }
      }
      return { field: step.field, display };
    });

    return (
      <Review
        entries={entries}
        bmiPreview={bmi(Number(answers.weightKg), Number(answers.heightCm))}
        totalSteps={totalSteps}
      />
    );
  }

  const step = ASSESSMENT_STEPS[stepIndex];
  const value = answers[step.field];
  const initialValue = Array.isArray(value)
    ? value
    : value === null || value === undefined
      ? null
      : String(value);

  return (
    <WizardStep
      field={step.field}
      kind={step.kind}
      required={step.required}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      initialValue={initialValue}
      currentWeightKg={
        step.field === "targetWeightKg" && answers.weightKg
          ? Number(answers.weightKg)
          : undefined
      }
    />
  );
}
