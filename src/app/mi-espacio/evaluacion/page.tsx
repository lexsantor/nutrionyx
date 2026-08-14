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
  CUSTOM_ANSWER_MAX,
  customIndexOf,
  maxReachableStep,
  nextStep,
  type AssessmentField,
} from "@/modules/assessment/definition";
import { answersFor, listQuestions } from "@/modules/assessment/questions";
import { bmi } from "@/modules/assessment/computed";
import { WizardStep } from "./wizard-step";
import { Review, type ReviewEntry } from "./review";
import type { Assessment } from "@/generated/prisma/client";

export const metadata = { title: "Mi evaluación" };
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

  // The consulta's own questions sit behind the fixed ten. They are optional,
  // so they never gate the end of the wizard, but the landing step has to
  // reach them: firstUnansweredStep alone would drop a patient straight on
  // the review the moment the fixed part was done.
  const [questions, customAnswers] = await Promise.all([
    listQuestions(patient.organizationId),
    answersFor(patient.organizationId, assessment.id),
  ]);
  const customAnswered = questions.map((q) => customAnswers.has(q.id));

  const maxReachable = maxReachableStep(answers, questions.length);
  const requested = Number.parseInt(paso ?? "", 10);
  const stepIndex = Number.isFinite(requested)
    ? Math.max(0, Math.min(requested, maxReachable))
    : nextStep(answers, customAnswered);

  const totalSteps = ASSESSMENT_STEPS.length + questions.length;

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

    for (const question of questions) {
      entries.push({
        field: question.id,
        label: question.prompt,
        display: customAnswers.get(question.id) ?? null,
      });
    }

    return (
      <Review
        entries={entries}
        bmiPreview={bmi(Number(answers.weightKg), Number(answers.heightCm))}
        totalSteps={totalSteps}
      />
    );
  }

  const customIndex = customIndexOf(stepIndex, questions.length);
  if (customIndex !== null) {
    const question = questions[customIndex];
    return (
      <WizardStep
        field={question.id}
        kind="text"
        required={false}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        initialValue={customAnswers.get(question.id) ?? null}
        customPrompt={question.prompt}
        customMaxLength={CUSTOM_ANSWER_MAX}
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
