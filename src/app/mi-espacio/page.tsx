import Link from "next/link";
import { getTranslations, getFormatter } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { findLatestAssessment } from "@/modules/assessment/repository";
import {
  ASSESSMENT_STEPS,
  firstUnansweredStep,
} from "@/modules/assessment/definition";
import { bmiCategory } from "@/modules/assessment/computed";
import { LogoutButton } from "../logout-button";

export const dynamic = "force-dynamic";

export default async function PatientHomePage() {
  const t = await getTranslations("patientHome");
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    redirect("/");
  }

  const assessment = await findLatestAssessment(patient.id);

  if (assessment?.status === "COMPLETED") {
    const format = await getFormatter();
    const bmiValue = Number(assessment.bmi);

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
        <div className="flex justify-end">
          <LogoutButton />
        </div>
        <h1 className="text-2xl font-bold">
          {t("welcome", { name: session.user.name })}
        </h1>

        <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-5">
          <h2 className="text-lg font-semibold">{t("summary.title")}</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">{t("summary.bmi")}</dt>
              <dd className="font-semibold">
                {bmiValue} · {t(`bmiCategories.${bmiCategory(bmiValue)}`)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">{t("summary.goal")}</dt>
              <dd className="font-semibold">
                {Number(assessment.targetWeightKg)} kg
              </dd>
            </div>
          </dl>
          <p className="text-xs text-zinc-500">
            {t("summary.completedAt", {
              date: format.dateTime(assessment.completedAt!, {
                dateStyle: "long",
              }),
            })}
          </p>
        </section>
      </main>
    );
  }

  const inProgress = assessment?.status === "IN_PROGRESS";
  const step = inProgress
    ? firstUnansweredStep({
        sex: assessment!.sex,
        birthDate: assessment!.birthDate,
        heightCm: assessment!.heightCm,
        weightKg: assessment!.weightKg,
        targetWeightKg: assessment!.targetWeightKg,
        activityLevel: assessment!.activityLevel,
        goals: assessment!.goals,
      })
    : 0;

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex justify-end px-4 py-3">
        <LogoutButton />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">
          {t("welcome", { name: session.user.name })}
        </h1>
      <p className="max-w-md text-sm text-zinc-600">
        {inProgress
          ? t("continueHint", {
              step: Math.min(step + 1, ASSESSMENT_STEPS.length),
              total: ASSESSMENT_STEPS.length,
            })
          : t("startHint")}
      </p>
      <Link
        href="/mi-espacio/evaluacion"
        className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
      >
        {inProgress ? t("continue") : t("start")}
        </Link>
      </div>
    </main>
  );
}
