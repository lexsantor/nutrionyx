"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import {
  ASSESSMENT_STEPS,
  validateAnswer,
  type AssessmentField,
} from "@/modules/assessment/definition";
import {
  completeAssessment,
  findLatestAssessment,
  saveAnswer,
} from "@/modules/assessment/repository";

export type WizardFormState = { errorKey: string } | null;

async function requirePatientAssessment() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) redirect("/");

  const assessment = await findLatestAssessment(patient.id);
  if (!assessment || assessment.status !== "IN_PROGRESS") {
    redirect("/mi-espacio");
  }

  return { patient, assessment };
}

export async function submitAnswer(
  _prevState: WizardFormState,
  formData: FormData,
): Promise<WizardFormState> {
  const fieldRaw = formData.get("field") as string;
  const step = ASSESSMENT_STEPS.find((s) => s.field === fieldRaw);
  if (!step) {
    return { errorKey: "generic" };
  }
  const field = step.field as AssessmentField;

  const raw =
    step.kind === "multi"
      ? formData.getAll("value").map(String)
      : (formData.get("value") as string);

  const result = validateAnswer(field, raw);
  if (!result.ok) {
    return { errorKey: result.errorKey };
  }

  const { assessment } = await requirePatientAssessment();

  const saved = await saveAnswer({
    assessmentId: assessment.id,
    organizationId: assessment.organizationId,
    field,
    value: result.value,
  });

  if (!saved.ok) {
    return { errorKey: "generic" };
  }

  const stepIndex = ASSESSMENT_STEPS.findIndex((s) => s.field === field);
  redirect(`/mi-espacio/evaluacion?paso=${stepIndex + 1}`);
}

export async function completeAction(): Promise<WizardFormState> {
  const { assessment } = await requirePatientAssessment();

  const result = await completeAssessment({
    assessmentId: assessment.id,
    organizationId: assessment.organizationId,
  });

  if (!result.ok) {
    if (result.missing && result.missing.length > 0) {
      const firstMissing = ASSESSMENT_STEPS.findIndex(
        (s) => s.field === result.missing![0],
      );
      redirect(`/mi-espacio/evaluacion?paso=${firstMissing}`);
    }
    return { errorKey: "generic" };
  }

  redirect("/mi-espacio");
}
