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
import {
  bodyComposition,
  listWeights,
  proteinOnDay,
} from "@/modules/measurement/repository";
import {
  fatMassKg,
  leanMassKg,
  waistHipRatio,
} from "@/modules/measurement/body";
import { getTargets } from "@/modules/targets/repository";
import { getPlan, listDoses } from "@/modules/medication/repository";
import { daysUntil, nextDoseDate } from "@/modules/medication/glp1";
import { Topbar } from "@/components/topbar";
import { WeightCheckIn } from "./weight-check-in";
import { ProteinLog } from "./protein-log";
import { BodyMetricsForm } from "./body-metrics-form";
import { PhotosCard } from "./photos-card";
import { listPhotos } from "@/modules/photos/repository";
import { listDocuments } from "@/modules/documents/repository";
import { PatientNav } from "./patient-nav";
import { WeightChart } from "@/components/weight-chart";

export const dynamic = "force-dynamic";

export default async function PatientHomePage({
  searchParams,
}: {
  searchParams: Promise<{ photoError?: string }>;
}) {
  const { photoError } = await searchParams;
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

    const tm = await getTranslations("medication");
    const plan = await getPlan(patient.organizationId, patient.id);
    const lastDoses = plan
      ? await listDoses(patient.organizationId, patient.id, 1)
      : [];
    let medicationLine: string | null = null;
    if (plan) {
      const now = new Date();
      const next = nextDoseDate(plan, lastDoses[0]?.takenAt ?? null, now);
      const days = daysUntil(next, now);
      medicationLine =
        days <= 0
          ? tm("next.due")
          : tm("next.in", {
              days,
              weekday: format.dateTime(next, { weekday: "long" }),
            });
    }

    const tt = await getTranslations("targets.today");
    const tb = await getTranslations("body");
    const td = await getTranslations("documents");
    const patientDocuments = await listDocuments(
      patient.organizationId,
      patient.id,
    );
    const body = await bodyComposition(patient.organizationId, patient.id);
    const ratio =
      body.waistCm != null && body.hipCm != null
        ? waistHipRatio(body.waistCm, body.hipCm)
        : null;
    const fatKg =
      body.weightKg != null && body.bodyFatPct != null
        ? fatMassKg(body.weightKg, body.bodyFatPct)
        : null;
    const leanKg =
      body.weightKg != null && body.bodyFatPct != null
        ? leanMassKg(body.weightKg, body.bodyFatPct)
        : null;
    const bodyRows = [
      body.waistCm != null ? { key: "waist", value: `${body.waistCm.toLocaleString("es")} cm` } : null,
      body.hipCm != null ? { key: "hip", value: `${body.hipCm.toLocaleString("es")} cm` } : null,
      ratio != null ? { key: "ratio", value: ratio.toLocaleString("es") } : null,
      body.bodyFatPct != null ? { key: "fatPct", value: `${body.bodyFatPct.toLocaleString("es")} %` } : null,
      fatKg != null ? { key: "fatKg", value: `${fatKg.toLocaleString("es")} kg` } : null,
      leanKg != null ? { key: "leanKg", value: `${leanKg.toLocaleString("es")} kg` } : null,
    ].filter((r) => r != null);
    const targets = await getTargets(patient.organizationId, patient.id);
    const proteinToday = targets?.proteinTargetG
      ? await proteinOnDay(patient.organizationId, patient.id, new Date())
      : 0;

    const weights = await listWeights(patient.organizationId, patient.id);
    const targetKg =
      assessment.targetWeightKg != null
        ? Number(assessment.targetWeightKg)
        : null;
    const points = weights.map((w) => ({
      recordedAt: w.recordedAt,
      valueKg: Number(w.value),
    }));

    const lastWeight = weights[weights.length - 1] ?? null;
    const weightToday =
      lastWeight != null &&
      lastWeight.recordedAt.toDateString() === new Date().toDateString();
    const planParts = targets
      ? [
          targets.kcalTarget != null
            ? tt("plan.kcal", { kcal: targets.kcalTarget })
            : null,
          targets.proteinTargetG != null
            ? tt("plan.protein", { grams: targets.proteinTargetG })
            : null,
          targets.sessionsPerWeek != null
            ? tt("plan.sessions", { sessions: targets.sessionsPerWeek })
            : null,
        ].filter(Boolean)
      : [];
    const proteinTarget = targets?.proteinTargetG ?? null;
    const proteinRatio =
      proteinTarget != null && proteinTarget > 0
        ? Math.min(1, proteinToday / proteinTarget)
        : 0;

    return (
      <>
        <Topbar nav={<PatientNav />} />
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

          <section className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{tm("next.label")}</h2>
              <Link
                href="/mi-espacio/medicacion"
                className="inline-flex h-9 items-center rounded-full border border-hairline bg-surface-1 px-4 text-sm font-semibold text-ink no-underline transition-colors hover:border-hairline-strong hover:bg-surface-2"
              >
                {plan ? tm("next.logCta") : tm("next.setupCta")}
              </Link>
            </div>
            {plan ? (
              <div className="flex flex-col gap-0.5">
                <p className="text-xl font-semibold">{medicationLine}</p>
                <p className="text-sm text-ink-subtle">
                  {plan.drugName} · {Number(plan.doseMg).toLocaleString("es")}{" "}
                  mg
                </p>
              </div>
            ) : (
              <p className="text-sm text-ink-subtle">{tm("next.none")}</p>
            )}
          </section>

          {targets ? (
            <section className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-lg font-semibold">{tt("title")}</h2>
                {planParts.length > 0 ? (
                  <p className="text-sm text-ink-subtle">
                    {planParts.join(" · ")}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium">{tt("weight")}</span>
                {weightToday ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                    {tt("weightDone", {
                      kg: Number(lastWeight!.value).toLocaleString("es"),
                    })}
                  </span>
                ) : (
                  <span className="text-sm text-ink-subtle">
                    {tt("weightPending")}
                  </span>
                )}
              </div>

              {proteinTarget != null ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium">
                      {tt("protein")}
                    </span>
                    <span
                      className={`text-sm font-medium tabular-nums ${
                        proteinRatio >= 1 ? "text-success" : "text-ink-subtle"
                      }`}
                    >
                      {proteinToday.toLocaleString("es")} g / {proteinTarget} g
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={Math.round(proteinRatio * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={tt("protein")}
                    className="h-1.5 overflow-hidden rounded-full bg-surface-3"
                  >
                    <div
                      className={`h-full rounded-full transition-[width] duration-300 ${
                        proteinRatio >= 1 ? "bg-success" : "bg-primary"
                      }`}
                      style={{ width: `${proteinRatio * 100}%` }}
                    />
                  </div>
                  <ProteinLog />
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6">
            <h2 className="text-lg font-semibold">{tp("title")}</h2>
            {points.length > 0 ? (
              <WeightChart points={points} targetKg={targetKg} />
            ) : (
              <p className="text-sm text-ink-subtle">{tp("empty")}</p>
            )}
            <WeightCheckIn />
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-lg font-semibold">{tb("title")}</h2>
              {body.updatedAt ? (
                <p className="text-sm text-ink-subtle">
                  {tb("updatedAt", {
                    date: format.dateTime(body.updatedAt, {
                      dateStyle: "medium",
                    }),
                  })}
                </p>
              ) : (
                <p className="text-sm text-ink-subtle">{tb("empty")}</p>
              )}
            </div>
            {bodyRows.length > 0 ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                {bodyRows.map((row) => (
                  <div key={row.key} className="flex flex-col">
                    <dt className="text-ink-subtle">{tb(`metrics.${row.key}`)}</dt>
                    <dd className="font-semibold tabular-nums">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <BodyMetricsForm />
          </section>

          <PhotosCard
            photos={(
              await listPhotos(patient.organizationId, patient.id)
            ).map((p) => ({
              id: p.id,
              createdAt: format.dateTime(p.createdAt, { dateStyle: "medium" }),
            }))}
            uploadError={photoError === "1"}
          />

          {patientDocuments.length > 0 ? (
            <section className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-6">
              <h2 className="text-lg font-semibold">{td("title")}</h2>
              <ul className="flex flex-col">
                {patientDocuments.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-3 border-b border-hairline py-2 last:border-0"
                  >
                    <a
                      href={`/api/documents/${doc.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 truncate text-sm font-medium text-ink no-underline transition-colors hover:text-accent-text"
                    >
                      {doc.fileName}
                    </a>
                    <span className="shrink-0 text-xs text-ink-subtle">
                      {format.dateTime(doc.createdAt, { dateStyle: "medium" })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <a
            href="/api/me/export"
            download
            className="self-center text-xs text-ink-subtle underline-offset-2 transition-colors hover:text-ink hover:underline"
          >
            {tb("exportLink")}
          </a>
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
      <Topbar nav={<PatientNav />} />
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
