import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { computeSliceMetrics } from "@/modules/assessment/metrics";
import { specialistDashboard } from "@/modules/dashboard/specialist";
import { ConsoleShell } from "@/components/console-shell";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

// Inicio: the specialist's at-a-glance dashboard. The patients table and invite
// flow now live in /panel/pacientes (Slice 5, adr/0005).
export default async function PanelPage() {
  const t = await getTranslations("panel");
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // Gate by domain role, not membership. Only nutritionists (Organization
  // Owners) see the console; patients and platform admins go to their area.
  const role = await resolveUserRole(session.user.id);
  if (role !== "nutritionist") {
    redirect(roleHome(role));
  }

  const { data: organizations } = await auth.organization.list();

  if (!organizations || organizations.length === 0) {
    redirect("/panel/nueva-organizacion");
  }

  const active = organizations[0];
  // Idempotent self-repair: the domain mirror always matches the auth org.
  const org = await ensureOrganization(active.id, active.name);
  const [metrics, dashboard] = await Promise.all([
    computeSliceMetrics(org.id),
    specialistDashboard(org.id),
  ]);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold">{org.name}</h1>

      <section className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-4">
          <Card>
            <p className="text-sm text-ink-subtle">
              {t("dashboard.activePatients")}
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {dashboard.activePatients}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-subtle">
              {t("dashboard.newIn30Days")}
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {dashboard.newIn30Days}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-subtle">
              {t("dashboard.withCompletedAssessment")}
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {dashboard.withCompletedAssessment}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-subtle">
              {t("dashboard.pendingFollowUp")}
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {dashboard.pendingFollowUp}
            </p>
          </Card>
        </section>

        <section className="grid grid-cols-2 gap-4 pb-6">
          <Card>
            <p className="text-base text-ink-subtle">
              {t("metrics.completionRate")}
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {metrics.completionRate !== null
                ? `${metrics.completionRate}%`
                : "—"}
            </p>
            <p className="text-xs text-ink-subtle">
              {t("metrics.completionTarget")} ·{" "}
              {t("metrics.completedOf", {
                completed: metrics.patientsCompleted,
                active: metrics.activePatients,
              })}
            </p>
          </Card>
          <Card>
            <p className="text-base text-ink-subtle">{t("metrics.medianTime")}</p>
            <p className="mt-1 text-2xl font-semibold">
              {metrics.medianCompletionMinutes !== null
                ? t("metrics.minutes", { min: metrics.medianCompletionMinutes })
                : "—"}
            </p>
            <p className="text-xs text-ink-subtle">{t("metrics.timeTarget")}</p>
          </Card>
        </section>
    </ConsoleShell>
  );
}
