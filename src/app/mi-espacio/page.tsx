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
import { listWeights } from "@/modules/measurement/repository";
import { Topbar } from "@/components/topbar";
import { LogoutButton } from "../logout-button";
import { WeightCheckIn } from "./weight-check-in";
import { WeightChart } from "./weight-chart";

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
    const tp = await getTranslations("progress");
    const bmiValue = Number(assessment.bmi);

    const weights = await listWeights(patient.organizationId, patient.id);
    const targetKg =
      assessment.targetWeightKg != null
        ? Number(assessment.targetWeightKg)
        : null;
    const points = weights.map((w) => ({
      recordedAt: w.recordedAt,
      valueKg: Number(w.value),
    }));

    return (
      <>
        <Topbar right={<LogoutButton />} />
        <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10">
          <h1 className="text-2xl font-semibold">
            {t("welcome", { name: session.user.name })}
          </h1>

          <section className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-6">
          <h2 className="text-lg font-semibold">{t("summary.title")}</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-subtle">{t("summary.bmi")}</dt>
              <dd className="font-semibold">
                {bmiValue} · {t(`bmiCategories.${bmiCategory(bmiValue)}`)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-subtle">{t("summary.goal")}</dt>
              <dd className="font-semibold">
                {Number(assessment.targetWeightKg)} kg
              </dd>
            </div>
          </dl>
          <p className="text-xs text-ink-subtle">
            {t("summary.completedAt", {
              date: format.dateTime(assessment.completedAt!, {
                dateStyle: "long",
              }),
            })}
          </p>
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6">
            <h2 className="text-lg font-semibold">{tp("title")}</h2>
            {points.length > 0 ? (
              <WeightChart points={points} targetKg={targetKg} />
            ) : (
              <p className="text-sm text-ink-subtle">{tp("empty")}</p>
            )}
            <WeightCheckIn />
          </section>
        </main>
      </>
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
    <>
      <Topbar right={<LogoutButton />} />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <h1 className="text-2xl font-semibold">
          {t("welcome", { name: session.user.name })}
        </h1>
        <p className="max-w-md text-sm text-ink-subtle">
          {inProgress
            ? t("continueHint", {
                step: Math.min(step + 1, ASSESSMENT_STEPS.length),
                total: ASSESSMENT_STEPS.length,
              })
            : t("startHint")}
        </p>
        <Link
          href="/mi-espacio/evaluacion"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
        >
          {inProgress ? t("continue") : t("start")}
        </Link>
      </main>
    </>
  );
}
