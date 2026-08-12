import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations, getFormatter } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { madridDayStart } from "@/modules/scheduling/time";
import { getPatientDetail } from "@/modules/patient/repository";
import { ageInYears } from "@/modules/patient/age";
import {
  bodyComposition,
  listMeasurementsSince,
  listWeights,
} from "@/modules/measurement/repository";
import {
  REPORT_WINDOW_DAYS,
  activeDays,
  expectedDoses,
  proteinAdherence,
  windowDelta,
} from "@/modules/reporting/adherence";
import {
  fatMassKg,
  leanMassKg,
  waistHipRatio,
  zoneStats,
  BODY_ZONES,
} from "@/modules/measurement/body";
import { BodyMapMeasures } from "@/components/body-map-measures";
import { getPlan, listDoses } from "@/modules/medication/repository";
import { getTargets } from "@/modules/targets/repository";
import { listNotes } from "@/modules/notes/repository";
import { listPhotos } from "@/modules/photos/repository";
import { listDocuments } from "@/modules/documents/repository";
import { getDietPlan } from "@/modules/diet/repository";
import {
  getRoutine,
  listSessions,
} from "@/modules/training/repository";
import { unreadCount } from "@/modules/messaging/repository";
import { DocumentsCard } from "./documents-card";
import { bmiCategory } from "@/modules/assessment/computed";
import { TargetsForm } from "./targets-form";
import { NoteForm } from "./note-form";
import { EraseForm } from "./erase-form";
import { Card } from "@/components/ui/card";
import { WeightChart } from "@/components/weight-chart";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-hairline px-4 py-2.5 last:border-0 even:bg-surface-2/50">
      <dt className="text-sm text-ink-subtle">{label}</dt>
      <dd className="text-right text-sm font-medium tabular-nums">{value}</dd>
    </div>
  );
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("patientDetail");
  const tw = await getTranslations("wizard");
  const tp = await getTranslations("panel.patients");
  const tm = await getTranslations("medication");
  const tPhotos = await getTranslations("photos");

  const { org } = await requireSpecialistOrg();

  // Org-scoped: a patient id from another consulta resolves to nothing → 404.
  const patient = await getPatientDetail(org.id, id);
  if (!patient) {
    notFound();
  }

  const assessment = patient.assessments[0] ?? null;

  // 28-day adherence window (docs/build/slice-15-plan.md)
  const since = madridDayStart(-REPORT_WINDOW_DAYS);

  // Every read is independent once the patient is resolved: one batch, no
  // request waterfall (audit 2026-08-11).
  const [
    targets,
    notes,
    photos,
    documents,
    dietPlan,
    routine,
    allSessions,
    unreadMessages,
    medicationPlan,
    allDoses,
    windowMeasurements,
    body,
    allBodyRows,
    weights,
  ] = await Promise.all([
    getTargets(org.id, patient.id),
    listNotes(org.id, patient.id),
    listPhotos(org.id, patient.id),
    listDocuments(org.id, patient.id),
    getDietPlan(org.id, patient.id),
    getRoutine(org.id, patient.id),
    listSessions(org.id, patient.id),
    unreadCount(org.id, patient.id, "SPECIALIST"),
    getPlan(org.id, patient.id),
    listDoses(org.id, patient.id),
    listMeasurementsSince(org.id, patient.id, since),
    bodyComposition(org.id, patient.id),
    listMeasurementsSince(org.id, patient.id, new Date(0)),
    listWeights(org.id, patient.id),
  ]);
  const recentDoses = allDoses.slice(0, 5);
  const windowWeights = windowMeasurements.filter((m) => m.kind === "WEIGHT");
  const windowProtein = windowMeasurements.filter((m) => m.kind === "PROTEIN");
  const windowDoses = allDoses.filter((d) => d.takenAt >= since);
  const weightWindowDelta = windowDelta(
    windowWeights.map((m) => ({ recordedAt: m.recordedAt, value: Number(m.value) })),
  );
  const targetsForReport = targets?.proteinTargetG ?? null;
  const proteinReport =
    targetsForReport != null
      ? proteinAdherence(
          windowProtein.map((m) => ({
            recordedAt: m.recordedAt,
            grams: Number(m.value),
          })),
          targetsForReport,
        )
      : null;
  const doseReport = medicationPlan
    ? {
        logged: windowDoses.length,
        expected: expectedDoses(medicationPlan.frequency),
      }
    : null;
  const windowSessions = allSessions.filter((s) => s.sessionAt >= since);
  const sessionReport =
    targets?.sessionsPerWeek != null
      ? { logged: windowSessions.length, expected: targets.sessionsPerWeek * 4 }
      : null;
  const activityDays = activeDays([
    ...windowMeasurements.map((m) => m.recordedAt),
    ...windowDoses.map((d) => d.takenAt),
    ...windowSessions.map((s) => s.sessionAt),
  ]);
  const format = await getFormatter();
  const rawZones = zoneStats(allBodyRows);
  const zonesForMap = Object.fromEntries(
    BODY_ZONES.flatMap((zone) => {
      const z = rawZones[zone.key];
      if (!z) return [];
      return [
        [
          zone.key,
          {
            ...z,
            currentDate: format.dateTime(z.currentDate, { dateStyle: "medium" }),
            initialDate: format.dateTime(z.initialDate, { dateStyle: "medium" }),
            previousDate: z.previousDate
              ? format.dateTime(z.previousDate, { dateStyle: "medium" })
              : null,
          },
        ],
      ];
    }),
  );
  const whRatio =
    body.waistCm != null && body.hipCm != null
      ? waistHipRatio(body.waistCm, body.hipCm)
      : null;
  const bodyFatKg =
    body.weightKg != null && body.bodyFatPct != null
      ? fatMassKg(body.weightKg, body.bodyFatPct)
      : null;
  const bodyLeanKg =
    body.weightKg != null && body.bodyFatPct != null
      ? leanMassKg(body.weightKg, body.bodyFatPct)
      : null;
  const hasBody =
    body.waistCm != null || body.hipCm != null || body.bodyFatPct != null;
  const points = weights.map((w) => ({
    recordedAt: w.recordedAt,
    valueKg: Number(w.value),
  }));

  const num = (v: unknown) => (v != null ? Number(v) : null);
  const bmiValue = num(assessment?.bmi);
  const targetKg = num(assessment?.targetWeightKg);
  const age =
    assessment?.birthDate != null ? ageInYears(assessment.birthDate) : null;

  const assessmentLabel =
    assessment?.status === "COMPLETED"
      ? tp("assessments.completed")
      : assessment?.status === "IN_PROGRESS"
        ? tp("assessments.inProgress")
        : tp("assessments.pending");

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href="/panel/pacientes"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-subtle no-underline transition-colors hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            {t("back")}
          </Link>
          <div className="rounded-[1.25rem] border border-hairline bg-ink/[0.04] p-1.5 shadow-el-bezel">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[calc(1.25rem-0.375rem)] bg-surface-1 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-semibold tracking-tight">
                  {patient.fullName}
                </h1>
                <span
                  className={
                    patient.status === "ACTIVE"
                      ? "inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success"
                      : "inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning"
                  }
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      patient.status === "ACTIVE" ? "bg-success" : "bg-warning"}`}
                  />
                  {tp(`statuses.${patient.status}`)}
                </span>
              </div>
              <p className="text-sm text-ink-subtle">{patient.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

        <Card className="lg:col-span-7">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                {t("report.title")}
              </h2>
              <span className="text-sm text-ink-subtle">
                {t("report.window", { days: REPORT_WINDOW_DAYS })}
              </span>
            </div>
            <dl className="flex flex-col text-sm">
              <Row
                label={t("report.weight")}
                value={
                  weightWindowDelta != null
                    ? t("report.weightValue", {
                        delta: `${weightWindowDelta > 0 ? "+" : ""}${weightWindowDelta.toLocaleString("es")}`,
                        count: windowWeights.length,
                      })
                    : t("report.insufficient")
                }
              />
              {proteinReport ? (
                <Row
                  label={t("report.protein")}
                  value={t("report.proteinValue", {
                    met: proteinReport.daysMet,
                    logged: proteinReport.daysLogged,
                    avg: proteinReport.avgPerLoggedDay,
                  })}
                />
              ) : null}
              {doseReport ? (
                <Row
                  label={t("report.medication")}
                  value={t("report.medicationValue", {
                    logged: doseReport.logged,
                    expected: doseReport.expected,
                  })}
                />
              ) : null}
              {sessionReport ? (
                <Row
                  label={t("report.training")}
                  value={t("report.trainingValue", {
                    logged: sessionReport.logged,
                    expected: sessionReport.expected,
                  })}
                />
              ) : null}
              <Row
                label={t("report.activity")}
                value={t("report.activityValue", {
                  days: activityDays,
                  total: REPORT_WINDOW_DAYS,
                })}
              />
            </dl>
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">{t("weight.title")}</h2>
            {points.length > 0 ? (
              <WeightChart points={points} targetKg={targetKg} />
            ) : (
              <p className="text-sm text-ink-subtle">{t("weight.empty")}</p>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-7">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{t("clinical.title")}</h2>
              <span className="text-sm text-ink-subtle">{assessmentLabel}</span>
            </div>

            {assessment && assessment.status === "COMPLETED" ? (
              <dl className="flex flex-col text-sm">
                {bmiValue != null ? (
                  <Row
                    label={t("clinical.bmi")}
                    value={`${bmiValue} · ${t(`clinical.bmiCategories.${bmiCategory(bmiValue)}`)}`}
                  />
                ) : null}
                {targetKg != null ? (
                  <Row
                    label={t("clinical.targetWeight")}
                    value={`${targetKg} kg`}
                  />
                ) : null}
                {assessment.sex ? (
                  <Row
                    label={t("clinical.sex")}
                    value={tw(`options.sex.${assessment.sex}`)}
                  />
                ) : null}
                {age != null ? (
                  <Row
                    label={t("clinical.age")}
                    value={t("clinical.ageYears", { years: age })}
                  />
                ) : null}
                {num(assessment.heightCm) != null ? (
                  <Row
                    label={t("clinical.height")}
                    value={`${num(assessment.heightCm)} cm`}
                  />
                ) : null}
                {assessment.activityLevel ? (
                  <Row
                    label={t("clinical.activity")}
                    value={tw(`options.activityLevel.${assessment.activityLevel}`)}
                  />
                ) : null}
                {assessment.goals.length > 0 ? (
                  <Row
                    label={t("clinical.goals")}
                    value={assessment.goals
                      .map((g) => tw(`options.goals.${g}`))
                      .join(", ")}
                  />
                ) : null}
                {assessment.conditions ? (
                  <Row
                    label={t("clinical.conditions")}
                    value={assessment.conditions}
                  />
                ) : null}
                {assessment.allergies ? (
                  <Row
                    label={t("clinical.allergies")}
                    value={assessment.allergies}
                  />
                ) : null}
                {assessment.currentMedication ? (
                  <Row
                    label={t("clinical.medication")}
                    value={assessment.currentMedication}
                  />
                ) : null}
              </dl>
            ) : (
              <p className="text-sm text-ink-subtle">{t("clinical.none")}</p>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">{t("targets.title")}</h2>
              <p className="text-sm text-ink-subtle">
                {t("targets.subtitle")}
              </p>
            </div>
            <TargetsForm
              patientId={patient.id}
              initial={
                targets
                  ? {
                      kcalTarget: targets.kcalTarget,
                      proteinTargetG: targets.proteinTargetG,
                      sessionsPerWeek: targets.sessionsPerWeek,
                    }
                  : null
              }
            />
          </div>
        </Card>

        <Card className="lg:col-span-12">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">{t("plans.title")}</h2>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline py-3 first:pt-0 last:border-0 last:pb-0">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-semibold">
                      {t("messages.title")}
                    </h3>
                    {unreadMessages > 0 ? (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-on-primary">
                        {unreadMessages}
                      </span>
                    ) : null}
                  </div>
                </div>
                <Link
                  href={`/panel/pacientes/${patient.id}/mensajes`}
                  className="inline-flex h-9 shrink-0 items-center rounded-full border border-hairline bg-surface-1 px-4 text-sm font-semibold text-ink no-underline transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150"
                >
                  {t("messages.open")}
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline py-3 last:border-0 last:pb-0">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h3 className="text-base font-semibold">{t("diet.title")}</h3>
                  <p className="text-sm text-ink-subtle">
                    {dietPlan
                      ? t("diet.updatedAt", {
                          date: format.dateTime(dietPlan.updatedAt, {
                            dateStyle: "medium",
                          }),
                        })
                      : t("diet.empty")}
                  </p>
                </div>
                <Link
                  href={`/panel/pacientes/${patient.id}/dieta`}
                  className="inline-flex h-9 shrink-0 items-center rounded-full border border-hairline bg-surface-1 px-4 text-sm font-semibold text-ink no-underline transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150"
                >
                  {dietPlan ? t("diet.edit") : t("diet.create")}
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline py-3 last:border-0 last:pb-0">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h3 className="text-base font-semibold">
                    {t("training.title")}
                  </h3>
                  <p className="text-sm text-ink-subtle">
                    {routine
                      ? t("training.updatedAt", {
                          date: format.dateTime(routine.updatedAt, {
                            dateStyle: "medium",
                          }),
                        })
                      : t("training.empty")}
                    {allSessions[0]
                      ? ` · ${t("training.lastSession", {
                          date: format.dateTime(allSessions[0].sessionAt, {
                            dateStyle: "medium",
                          }),
                        })}`
                      : ""}
                  </p>
                </div>
                <Link
                  href={`/panel/pacientes/${patient.id}/entreno`}
                  className="inline-flex h-9 shrink-0 items-center rounded-full border border-hairline bg-surface-1 px-4 text-sm font-semibold text-ink no-underline transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150"
                >
                  {routine ? t("training.edit") : t("training.create")}
                </Link>
              </div>
            </div>
          </div>
        </Card>


        <Card className="lg:col-span-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              {t("medication.title")}
            </h2>
            {medicationPlan ? (
              <>
                <dl className="flex flex-col text-sm">
                  <Row
                    label={t("medication.drug")}
                    value={
                      medicationPlan.genericName
                        ? `${medicationPlan.drugName} (${medicationPlan.genericName})`
                        : medicationPlan.drugName
                    }
                  />
                  <Row
                    label={t("medication.dose")}
                    value={`${Number(medicationPlan.doseMg).toLocaleString("es")} mg`}
                  />
                  <Row
                    label={t("medication.frequency")}
                    value={tm(`setup.frequencies.${medicationPlan.frequency}`)}
                  />
                  {recentDoses[0] ? (
                    <Row
                      label={t("medication.lastDose")}
                      value={`${format.dateTime(recentDoses[0].takenAt, { dateStyle: "medium" })} · ${tm(`sites.${recentDoses[0].site}`)}`}
                    />
                  ) : null}
                </dl>
                {recentDoses.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm font-medium text-ink-subtle">
                      {t("medication.recent")}
                    </h3>
                    <ul className="flex flex-col">
                      {recentDoses.map((dose) => (
                        <li
                          key={dose.id}
                          className="flex items-baseline justify-between gap-4 border-b border-hairline py-2 last:border-0"
                        >
                          <span className="text-sm">
                            {format.dateTime(dose.takenAt, {
                              dateStyle: "medium",
                            })}
                          </span>
                          <span className="text-sm tabular-nums text-ink-subtle">
                            {Number(dose.doseMg).toLocaleString("es")} mg ·{" "}
                            {tm(`sites.${dose.site}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-ink-subtle">
                    {t("medication.noDoses")}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-ink-subtle">{t("medication.empty")}</p>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-7">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">{t("notes.title")}</h2>
              <p className="text-sm text-ink-subtle">{t("notes.subtitle")}</p>
            </div>
            <NoteForm patientId={patient.id} />
            {notes.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="flex flex-col gap-1 rounded-[10px] bg-surface-2 px-4 py-3"
                  >
                    <span className="text-xs text-ink-subtle">
                      {format.dateTime(note.createdAt, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    <p className="whitespace-pre-wrap text-sm">{note.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-subtle">{t("notes.empty")}</p>
            )}
          </div>
        </Card>


        <Card className="lg:col-span-12">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{t("body.title")}</h2>
              {body.updatedAt ? (
                <span className="text-sm text-ink-subtle">
                  {format.dateTime(body.updatedAt, { dateStyle: "medium" })}
                </span>
              ) : null}
            </div>
            <BodyMapMeasures zones={zonesForMap} sex={assessment?.sex ?? null} />
            {hasBody ? (
              <dl className="flex flex-col border-t border-hairline pt-3 text-sm">
                {body.waistCm != null ? (
                  <Row
                    label={t("body.waist")}
                    value={`${body.waistCm.toLocaleString("es")} cm`}
                  />
                ) : null}
                {body.hipCm != null ? (
                  <Row
                    label={t("body.hip")}
                    value={`${body.hipCm.toLocaleString("es")} cm`}
                  />
                ) : null}
                {whRatio != null ? (
                  <Row
                    label={t("body.ratio")}
                    value={whRatio.toLocaleString("es")}
                  />
                ) : null}
                {body.bodyFatPct != null ? (
                  <Row
                    label={t("body.fatPct")}
                    value={`${body.bodyFatPct.toLocaleString("es")} %`}
                  />
                ) : null}
                {bodyFatKg != null ? (
                  <Row
                    label={t("body.fatKg")}
                    value={`${bodyFatKg.toLocaleString("es")} kg`}
                  />
                ) : null}
                {bodyLeanKg != null ? (
                  <Row
                    label={t("body.leanKg")}
                    value={`${bodyLeanKg.toLocaleString("es")} kg`}
                  />
                ) : null}
              </dl>
            ) : (
              <p className="text-sm text-ink-subtle">{t("body.empty")}</p>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{t("photos.title")}</h2>
            {photos.length > 0 ? (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((photo) => (
                  <li
                    key={photo.id}
                    className="relative aspect-[3/4] overflow-hidden rounded-[10px] border border-field-border bg-surface-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/photos/${photo.id}`}
                      width={600}
                      height={800}
                      alt={tPhotos("photoAlt", {
                        date: format.dateTime(photo.createdAt, {
                          dateStyle: "medium",
                        }),
                      })}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute bottom-0 left-0 right-0 bg-canvas/80 px-2 py-1 text-xs text-ink-subtle backdrop-blur">
                      {format.dateTime(photo.createdAt, {
                        dateStyle: "medium",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-subtle">{t("photos.empty")}</p>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-7">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">{t("documents.title")}</h2>
              <p className="text-sm text-ink-subtle">
                {t("documents.subtitle")}
              </p>
            </div>
            <DocumentsCard
              patientId={patient.id}
              documents={documents.map((d) => ({
                id: d.id,
                fileName: d.fileName,
                createdAt: format.dateTime(d.createdAt, {
                  dateStyle: "medium",
                }),
              }))}
            />
          </div>
        </Card>

        <Card className="border-error/40 lg:col-span-12">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-error">
                {t("erase.title")}
              </h2>
              <p className="text-sm text-ink-subtle">{t("erase.subtitle")}</p>
            </div>
            <EraseForm patientId={patient.id} patientName={patient.fullName ?? patient.id} />
          </div>
        </Card>
        </div>
      </div>
    </>
  );
}
