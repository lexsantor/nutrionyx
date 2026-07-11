import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { listPatientsWithLatestAssessment } from "@/modules/patient/repository";
import { computeSliceMetrics } from "@/modules/assessment/metrics";
import { latestWeightByPatient } from "@/modules/measurement/repository";
import { weightDelta } from "@/modules/measurement/progress";
import { Topbar } from "@/components/topbar";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "../logout-button";
import { InviteForm } from "./invite-form";
import { CancelInvitationButton } from "./cancel-button";

export const dynamic = "force-dynamic";

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
  const patients = await listPatientsWithLatestAssessment(org.id);
  const metrics = await computeSliceMetrics(org.id);
  const latestWeights = await latestWeightByPatient(org.id);

  const { data: pending } = await auth.organization.listInvitations({
    query: { organizationId: active.id },
  });
  const pendingInvitations = (pending ?? []).filter(
    (invitation) => invitation.status === "pending",
  );

  return (
    <>
      <Topbar
        right={
          <>
            <Link
              href="/panel/ajustes"
              className="text-sm text-ink-subtle underline underline-offset-2 hover:text-ink"
            >
              {t("settingsLink")}
            </Link>
            <span className="text-sm text-ink-subtle">{session.user.name}</span>
            <LogoutButton />
          </>
        }
      />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold">{active.name}</h1>

        <section className="grid grid-cols-2 gap-4 py-6">
          <Card>
            <p className="text-sm text-ink-subtle">
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
            <p className="text-sm text-ink-subtle">{t("metrics.medianTime")}</p>
            <p className="mt-1 text-2xl font-semibold">
              {metrics.medianCompletionMinutes !== null
                ? t("metrics.minutes", { min: metrics.medianCompletionMinutes })
                : "—"}
            </p>
            <p className="text-xs text-ink-subtle">{t("metrics.timeTarget")}</p>
          </Card>
        </section>

      <section className="flex flex-col gap-6 py-2">
        <h2 className="text-lg font-semibold">{t("patients.title")}</h2>

        {patients.length === 0 ? (
          <p className="text-sm text-ink-subtle">{t("patients.empty")}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-ink-subtle">
                <th scope="col" className="py-2 pr-4 font-medium">
                  {t("patients.name")}
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  {t("patients.email")}
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  {t("patients.status")}
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  {t("patients.assessment")}
                </th>
                <th scope="col" className="py-2 font-medium">
                  {t("patients.weight")}
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => {
                const assessment = patient.assessments[0] ?? null;
                const latest = latestWeights.get(patient.id);
                const latestKg = latest ? Number(latest.value) : null;
                const targetKg =
                  assessment?.targetWeightKg != null
                    ? Number(assessment.targetWeightKg)
                    : null;
                const wDelta =
                  latestKg != null && targetKg != null
                    ? weightDelta(latestKg, targetKg)
                    : null;
                const fmtKg = (v: number) =>
                  v.toLocaleString("es-ES", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  });
                return (
                  <tr key={patient.id} className="border-b border-hairline">
                    <td className="py-2 pr-4">{patient.fullName}</td>
                    <td className="py-2 pr-4">{patient.email}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          patient.status === "ACTIVE"
                            ? "rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success"
                            : "rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning"
                        }
                      >
                        {t(`patients.statuses.${patient.status}`)}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-sm">
                      {assessment?.status === "COMPLETED"
                        ? `${t("patients.assessments.completed")} · ${t("patients.assessments.bmi")} ${Number(assessment.bmi)}`
                        : assessment?.status === "IN_PROGRESS"
                          ? t("patients.assessments.inProgress")
                          : t("patients.assessments.pending")}
                    </td>
                    <td className="py-2 text-sm">
                      {latestKg != null ? (
                        <span>
                          {fmtKg(latestKg)} kg
                          {wDelta != null && wDelta !== 0 ? (
                            <span className="text-ink-subtle">
                              {" "}
                              ({wDelta > 0 ? "+" : "−"}
                              {fmtKg(Math.abs(wDelta))})
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-ink-tertiary">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <InviteForm />

        {pendingInvitations.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">{t("invitations.title")}</h3>
            <p className="text-xs text-ink-subtle">{t("invitations.hint")}</p>
            <ul className="flex flex-col gap-1 text-sm">
              {pendingInvitations.map((invitation) => (
                <li key={invitation.id} className="flex flex-wrap items-center gap-2">
                  <span>{invitation.email}</span>
                  <code className="rounded bg-surface-3 px-2 py-0.5 text-xs">
                    /auth/accept-invitation?invitationId={invitation.id}
                  </code>
                  <CancelInvitationButton invitationId={invitation.id} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        </section>
      </main>
    </>
  );
}
