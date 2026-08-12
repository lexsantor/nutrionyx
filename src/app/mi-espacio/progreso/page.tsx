import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { requirePatient } from "@/lib/auth/patient";
import { findLatestAssessment } from "@/modules/assessment/repository";
import {
  bodyComposition,
  listMeasurementsSince,
  listWeights,
} from "@/modules/measurement/repository";
import {
  BODY_ZONES,
  fatMassKg,
  leanMassKg,
  waistHipRatio,
  zoneStats,
} from "@/modules/measurement/body";
import { listPhotos } from "@/modules/photos/repository";
import { WeightChart } from "@/components/weight-chart";
import { BodyMapMeasures } from "@/components/body-map-measures";
import { BodyMetricsForm } from "../body-metrics-form";
import { PhotosCard } from "../photos-card";

export const metadata = { title: "Progreso" };
export const dynamic = "force-dynamic";

const TILE =
  "flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6 shadow-el-sm";

/**
 * "Am I getting better" (docs/build/navigation-audit.md, tier 2). Weight
 * history, body composition and photos used to be three tiles competing
 * with the daily check-in on the home page; the question they answer is a
 * different one, asked at a different rhythm.
 */
export default async function PatientProgressPage() {
  const t = await getTranslations("patientProgress");
  const tp = await getTranslations("progress");
  const tb = await getTranslations("body");
  const format = await getFormatter();
  const { patient } = await requirePatient();

  const assessment = await findLatestAssessment(patient.id);
  const [weights, body, allMeasurements, photos] = await Promise.all([
    listWeights(patient.organizationId, patient.id),
    bodyComposition(patient.organizationId, patient.id),
    listMeasurementsSince(patient.organizationId, patient.id, new Date(0)),
    listPhotos(patient.organizationId, patient.id),
  ]);

  const points = weights.map((w) => ({
    recordedAt: w.recordedAt,
    valueKg: Number(w.value),
  }));
  const targetKg =
    assessment?.targetWeightKg != null
      ? Number(assessment.targetWeightKg)
      : null;
  const first = points[0] ?? null;
  const last = points[points.length - 1] ?? null;
  const delta = first && last ? last.valueKg - first.valueKg : null;

  const rawZones = zoneStats(allMeasurements);
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

  const metrics = [
    body.bodyFatPct != null
      ? { key: "fatPct", value: `${body.bodyFatPct.toLocaleString("es")} %` }
      : null,
    ratio != null ? { key: "ratio", value: ratio.toLocaleString("es") } : null,
    fatKg != null
      ? { key: "fatKg", value: `${fatKg.toLocaleString("es")} kg` }
      : null,
    leanKg != null
      ? { key: "leanKg", value: `${leanKg.toLocaleString("es")} kg` }
      : null,
  ].filter((x) => x != null);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-base text-ink-subtle">{t("subtitle")}</p>
        </div>

        <section className={TILE}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-lg font-semibold">{tp("title")}</h2>
            {delta != null && points.length > 1 ? (
              <p className="text-sm text-ink-subtle">
                {t("sinceStart", {
                  delta: `${delta > 0 ? "+" : ""}${delta.toLocaleString("es", {
                    maximumFractionDigits: 1,
                  })}`,
                  date: format.dateTime(first!.recordedAt, {
                    dateStyle: "medium",
                  }),
                })}
              </p>
            ) : null}
          </div>
          {points.length > 0 ? (
            <>
              <WeightChart points={points} targetKg={targetKg} />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">{t("weightTable")}</caption>
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-ink-subtle">
                      <th scope="col" className="py-1.5 font-medium">
                        {t("date")}
                      </th>
                      <th scope="col" className="py-1.5 text-right font-medium">
                        {t("weight")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Newest first: the last entries are the ones a patient
                        checks, and an old log should not be scrolled past. */}
                    {[...points].reverse().map((point) => (
                      <tr
                        key={point.recordedAt.toISOString()}
                        className="border-t border-hairline"
                      >
                        <td className="py-1.5">
                          {format.dateTime(point.recordedAt, {
                            dateStyle: "medium",
                          })}
                        </td>
                        <td className="py-1.5 text-right tabular-nums">
                          {point.valueKg.toLocaleString("es")} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-subtle">{tp("empty")}</p>
          )}
          <p className="text-xs text-ink-subtle">
            {t.rich("logHint", {
              link: (chunks) => (
                <Link href="/mi-espacio" className="text-accent-text">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </section>

        <section className={TILE}>
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
          <BodyMapMeasures zones={zonesForMap} sex={assessment?.sex ?? null} />

          {metrics.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-hairline pt-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {metrics.map((row) => (
                  <div
                    key={row.key}
                    className="rounded-[10px] bg-surface-2 px-3.5 py-2.5"
                  >
                    <p className="text-xs font-medium text-ink-subtle">
                      {tb(`metrics.${row.key}`)}
                    </p>
                    <p className="font-display text-xl font-semibold tabular-nums">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
              {leanKg != null && fatKg != null ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary"
                      style={{ width: `${(leanKg / (leanKg + fatKg)) * 100}%` }}
                    />
                    <div className="flex-1 bg-surface-4" />
                  </div>
                  <div className="flex justify-between text-xs text-ink-subtle">
                    <span>
                      <span className="mr-1 inline-block size-2 rounded-full bg-primary align-middle" />
                      {tb("metrics.leanKg")} · {leanKg.toLocaleString("es")} kg
                    </span>
                    <span>
                      {tb("metrics.fatKg")} · {fatKg.toLocaleString("es")} kg
                      <span className="ml-1 inline-block size-2 rounded-full bg-surface-4 align-middle" />
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          <BodyMetricsForm />
        </section>

        <PhotosCard
          photos={photos.map((p) => ({
            id: p.id,
            createdAt: format.dateTime(p.createdAt, { dateStyle: "medium" }),
          }))}
        />
      </div>
    </>
  );
}
