import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { getPatientDetail } from "@/modules/patient/repository";
import { getOrgProfile } from "@/modules/organization/repository";
import { getTargets } from "@/modules/targets/repository";
import { listMeasurementsSince } from "@/modules/measurement/repository";
import { listSessions } from "@/modules/training/repository";
import {
  getPlanForSpecialist,
  listDosesForSpecialist,
} from "@/modules/medication/repository";
import {
  REPORT_WINDOW_DAYS,
  activeDays,
  expectedDoses,
  proteinAdherence,
  windowDelta,
} from "@/modules/reporting/adherence";
import { madridDayStart } from "@/modules/scheduling/time";
import { PrintFrame } from "../../print-frame";

export const metadata = { title: "Informe" };
export const dynamic = "force-dynamic";

/**
 * The adherence report on paper. The console has read it since slice 12 and
 * it never left the screen, so a patient could not take their own evolution
 * home and a specialist could not file it.
 *
 * The numbers are assembled exactly as the record assembles them, from the
 * same pure helpers in `modules/reporting/adherence`. Duplicating the
 * assembly rather than extracting it is deliberate for now: the two views
 * want different rows soon (the record shows five recent doses, a printed
 * report should not), and a shared component built before that divergence
 * would have to be unbuilt.
 *
 * Medication follows the same rule as everywhere else: it appears only while
 * the patient shares it, because the reader here is the specialist.
 */
export default async function ReportPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("patientDetail");
  const tp = await getTranslations("print");
  const { org } = await requireSpecialistOrg();

  const patient = await getPatientDetail(org.id, id);
  if (!patient) notFound();

  const since = madridDayStart(-REPORT_WINDOW_DAYS);
  const [
    profile,
    targets,
    windowMeasurements,
    allSessions,
    medicationPlan,
    allDoses,
  ] = await Promise.all([
    getOrgProfile(org.id),
    getTargets(org.id, patient.id),
    listMeasurementsSince(org.id, patient.id, since),
    listSessions(org.id, patient.id),
    getPlanForSpecialist(org.id, patient.id),
    listDosesForSpecialist(org.id, patient.id),
  ]);

  const windowWeights = windowMeasurements.filter((m) => m.kind === "WEIGHT");
  const windowProtein = windowMeasurements.filter((m) => m.kind === "PROTEIN");
  const windowDoses = allDoses.filter((d) => d.takenAt >= since);
  const windowSessions = allSessions.filter((s) => s.sessionAt >= since);

  const weightDelta = windowDelta(
    windowWeights.map((m) => ({
      recordedAt: m.recordedAt,
      value: Number(m.value),
    })),
  );
  const protein =
    targets?.proteinTargetG != null
      ? proteinAdherence(
          windowProtein.map((m) => ({
            recordedAt: m.recordedAt,
            grams: Number(m.value),
          })),
          targets.proteinTargetG,
        )
      : null;
  const doses = medicationPlan
    ? { logged: windowDoses.length, expected: expectedDoses(medicationPlan.frequency) }
    : null;
  const sessions =
    targets?.sessionsPerWeek != null
      ? { logged: windowSessions.length, expected: targets.sessionsPerWeek * 4 }
      : null;
  const days = activeDays([
    ...windowMeasurements.map((m) => m.recordedAt),
    ...windowDoses.map((d) => d.takenAt),
    ...windowSessions.map((s) => s.sessionAt),
  ]);

  const rows: { label: string; value: string }[] = [
    {
      label: t("report.weight"),
      value:
        weightDelta === null
          ? t("report.insufficient")
          : t("report.weightValue", {
              delta: `${weightDelta > 0 ? "+" : ""}${weightDelta.toLocaleString("es")}`,
              count: windowWeights.length,
            }),
    },
    ...(protein
      ? [
          {
            label: t("report.protein"),
            value: t("report.proteinValue", {
              met: protein.daysMet,
              logged: protein.daysLogged,
              avg: protein.avgPerLoggedDay,
            }),
          },
        ]
      : []),
    ...(doses
      ? [
          {
            label: t("report.medication"),
            value: t("report.medicationValue", {
              logged: doses.logged,
              expected: doses.expected,
            }),
          },
        ]
      : []),
    ...(sessions
      ? [
          {
            label: t("report.training"),
            value: t("report.trainingValue", {
              logged: sessions.logged,
              expected: sessions.expected,
            }),
          },
        ]
      : []),
    {
      label: t("report.activity"),
      value: t("report.activityValue", {
        days,
        total: REPORT_WINDOW_DAYS,
      }),
    },
  ];

  return (
    <PrintFrame
      consulta={profile?.name ?? org.name}
      logoUrl={profile?.logoUrl ?? null}
      kind={t("report.title")}
      patientName={patient.fullName ?? patient.email}
      title={t("report.title")}
      subtitle={t("report.window", { days: REPORT_WINDOW_DAYS })}
      printLabel={tp("print")}
      backHref={`/panel/pacientes/${patient.id}`}
      backLabel={tp("back")}
      notesLabel={tp("notes")}
      fiscal={[
        profile?.legalName,
        profile?.taxId,
        profile?.addressLine,
        [profile?.postalCode, profile?.locality].filter(Boolean).join(" ") || null,
        profile?.hours,
      ].filter((part): part is string => Boolean(part && part.trim()))}
      footer={null}
    >
      <dl className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-6 border-b border-hairline py-2 last:border-0"
          >
            <dt className="text-[10pt] text-ink-subtle">{row.label}</dt>
            <dd className="text-right text-[10pt] font-medium tabular-nums">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </PrintFrame>
  );
}
