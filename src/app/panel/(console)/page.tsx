import { getTranslations } from "next-intl/server";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { computeSliceMetrics } from "@/modules/assessment/metrics";
import { specialistDashboard } from "@/modules/dashboard/specialist";
import { specialtyConfig } from "@/modules/specialty/config";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Panel" };

export const dynamic = "force-dynamic";

// Inicio: the specialist's at-a-glance dashboard. The patients table and invite
// flow now live in /panel/pacientes (Slice 5, adr/0005).
export default async function PanelPage() {
  const t = await getTranslations("panel");
  const tRoot = await getTranslations();
  const { org } = await requireSpecialistOrg();
  const [metrics, dashboard] = await Promise.all([
    computeSliceMetrics(org.id),
    specialistDashboard(org.id),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{org.name}</h1>
        {org.specialtyType ? (
          <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-on-primary-subtle">
            {tRoot(specialtyConfig(org.specialtyType).labelKey)}
          </span>
        ) : null}
      </div>

      <section className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-4">
          <Card className="col-span-2 row-span-2 flex flex-col justify-between">
            <p className="text-sm text-ink-subtle">
              {t("dashboard.activePatients")}
            </p>
            <p className="font-display text-6xl font-semibold tracking-tight tabular-nums">
              {dashboard.activePatients}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-subtle">
              {t("dashboard.newIn30Days")}
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
              {dashboard.newIn30Days}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-subtle">
              {t("dashboard.withCompletedAssessment")}
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
              {dashboard.withCompletedAssessment}
            </p>
          </Card>
          <Card className="col-span-2">
            <p className="text-sm text-ink-subtle">
              {t("dashboard.pendingFollowUp")}
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
              {dashboard.pendingFollowUp}
            </p>
          </Card>
        </section>

        <h2 className="text-lg font-semibold">{t("metrics.title")}</h2>

        <section className="grid grid-cols-2 gap-4 pb-6">
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-subtle">
                {t("metrics.completionRate")}
              </p>
              <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                {metrics.completionRate !== null
                  ? `${metrics.completionRate}%`
                  : "—"}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-success"
                style={{
                  width: `${metrics.completionRate ?? 0}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-subtle">
              {t("metrics.completedOf", {
                completed: metrics.patientsCompleted,
                active: metrics.activePatients,
              })}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-subtle">{t("metrics.medianTime")}</p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
              {metrics.medianCompletionMinutes !== null
                ? t("metrics.minutes", { min: metrics.medianCompletionMinutes })
                : "—"}
            </p>
            <p className="mt-2 text-xs text-ink-subtle">{t("metrics.timeTarget")}</p>
          </Card>
        </section>
    </>
  );
}
