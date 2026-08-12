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
import { listWeights, proteinOnDay } from "@/modules/measurement/repository";
import { getTargets } from "@/modules/targets/repository";
import { getPlan, listDoses } from "@/modules/medication/repository";
import { daysUntil, nextDoseDate } from "@/modules/medication/glp1";
import { Topbar } from "@/components/topbar";
import { WeightCheckIn } from "./weight-check-in";
import { ProteinLog } from "./protein-log";
import { listUpcomingByPatient } from "@/modules/scheduling/repository";
import { PatientNav } from "./patient-nav";
import { ButtonLink } from "@/components/ui/button-link";
import { sameMadridDay } from "@/modules/scheduling/time";

export const metadata = { title: "Mi espacio" };

export const dynamic = "force-dynamic";

// Bento tile: shared card surface with premium hover physics.
const TILE =
  "flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6 shadow-el-sm transition-[transform,box-shadow] duration-500 ease-house hover:-translate-y-0.5 hover:shadow-el-md";

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

    const tm = await getTranslations("medication");

    // Every read is independent once the patient is resolved: one batch,
    // no request waterfall on the highest-frequency screen (audit 2026-08-12).
    const [plan, lastDoses, upcomingAll, targets, proteinToday, weights] =
      await Promise.all([
        getPlan(patient.organizationId, patient.id),
        listDoses(patient.organizationId, patient.id, 1),
        listUpcomingByPatient(patient.organizationId, patient.id, new Date()),
        getTargets(patient.organizationId, patient.id),
        proteinOnDay(patient.organizationId, patient.id, new Date()),
        listWeights(patient.organizationId, patient.id),
      ]);
    const upcomingAppointments = upcomingAll.slice(0, 3);

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
    const ta = await getTranslations("agenda");

    const lastWeight = weights[weights.length - 1] ?? null;
    const weightToday =
      lastWeight != null && sameMadridDay(lastWeight.recordedAt);
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

    // Bento pairs: when a row partner is absent, the survivor takes the row.
    const medicationSpan = targets ? "lg:col-span-4" : "lg:col-span-12";

    return (
      <>
        <Topbar nav={<PatientNav />} />
        <main id="contenido" className="mx-auto w-full max-w-6xl px-6 py-10">
          <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight">
            {t("welcome", { name: session.user.name })}
          </h1>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {targets ? (
            <section className={`${TILE} lg:col-span-8`}>
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
                      className={`h-full w-full origin-left rounded-full transition-transform duration-300 ease-house ${
                        proteinRatio >= 1 ? "bg-success" : "bg-primary"
                      }`}
                      style={{ transform: `scaleX(${proteinRatio})` }}
                    />
                  </div>
                  <ProteinLog />
                </div>
              ) : null}
              <WeightCheckIn />
            </section>
          ) : null}

          <section className={`${TILE} ${medicationSpan}`}>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold">{tm("next.label")}</h2>
              <ButtonLink href="/mi-espacio/medicacion" size="sm">
                {plan ? tm("next.logCta") : tm("next.setupCta")}
              </ButtonLink>
            </div>
            {plan ? (
              <div className="flex flex-col gap-0.5">
                <p className="font-display text-xl font-semibold">
                  {medicationLine}
                </p>
                <p className="text-sm text-ink-subtle">
                  {plan.drugName} · {Number(plan.doseMg).toLocaleString("es")}{" "}
                  mg
                </p>
              </div>
            ) : (
              <p className="text-sm text-ink-subtle">{tm("next.none")}</p>
            )}
          </section>

          {upcomingAppointments.length > 0 ? (
            <section className={`${TILE} lg:col-span-12`}>
              <h2 className="text-lg font-semibold">
                {ta("patientCardTitle")}
              </h2>
              <ul className="flex flex-col">
                {upcomingAppointments.map((cita) => (
                  <li
                    key={cita.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-hairline py-2.5 last:border-0"
                  >
                    <span className="text-sm font-semibold first-letter:uppercase">
                      {format.dateTime(cita.startsAt, {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </span>
                    <span className="text-xs text-ink-subtle">
                      {ta(`modes.${cita.mode}`)}
                      {cita.videoUrl ? (
                        <>
                          {" · "}
                          <a
                            href={cita.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-accent-text transition-colors hover:text-primary"
                          >
                            {ta("joinVideo")}
                          </a>
                        </>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          </div>
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
      <main id="contenido" className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
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
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-[transform,background-color] hover:bg-primary-hover active:scale-[0.98] active:duration-150"
        >
          {inProgress ? t("continue") : t("start")}
        </Link>
      </main>
    </>
  );
}
