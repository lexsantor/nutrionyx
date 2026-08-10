import Link from "next/link";
import { getTranslations, getFormatter } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { getPlan, listDoses } from "@/modules/medication/repository";
import {
  daysUntil,
  nextDoseDate,
  suggestNextSite,
} from "@/modules/medication/glp1";
import { Topbar } from "@/components/topbar";
import { Card } from "@/components/ui/card";
import { PlanForm } from "./plan-form";
import { DoseForm } from "./dose-form";

export const dynamic = "force-dynamic";

export default async function MedicationPage() {
  const t = await getTranslations("medication");
  const format = await getFormatter();

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    redirect("/");
  }

  const plan = await getPlan(patient.organizationId, patient.id);
  const doses = plan
    ? await listDoses(patient.organizationId, patient.id, 10)
    : [];
  const lastDose = doses[0] ?? null;

  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  let nextLine: string | null = null;
  if (plan) {
    const next = nextDoseDate(plan, lastDose?.takenAt ?? null, now);
    const days = daysUntil(next, now);
    nextLine =
      days <= 0
        ? t("next.due")
        : t("next.in", {
            days,
            weekday: format.dateTime(next, { weekday: "long" }),
          });
  }

  return (
    <>
      <Topbar />
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10">
        <div className="flex flex-col gap-2">
          <Link
            href="/mi-espacio"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-subtle no-underline transition-colors hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            {t("back")}
          </Link>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-ink-subtle">{t("guardrail")}</p>
        </div>

        {plan ? (
          <>
            <Card>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold">{t("log.title")}</h2>
                  <p className="text-sm text-ink-subtle">
                    {plan.drugName}
                    {plan.genericName ? ` (${plan.genericName})` : ""} ·{" "}
                    {nextLine}
                  </p>
                </div>
                <DoseForm
                  planDoseMg={Number(plan.doseMg)}
                  suggested={suggestNextSite(lastDose?.site ?? null)}
                  todayISO={todayISO}
                />
              </div>
            </Card>

            <Card>
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold">{t("history.title")}</h2>
                {doses.length > 0 ? (
                  <ul className="flex flex-col">
                    {doses.map((dose) => (
                      <li
                        key={dose.id}
                        className="flex items-baseline justify-between gap-4 border-b border-hairline py-2.5 last:border-0"
                      >
                        <span className="text-sm">
                          {format.dateTime(dose.takenAt, {
                            dateStyle: "medium",
                          })}
                        </span>
                        <span className="text-sm text-ink-subtle">
                          {Number(dose.doseMg).toLocaleString("es")} mg ·{" "}
                          {t(`sites.${dose.site}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-subtle">
                    {t("history.empty")}
                  </p>
                )}
              </div>
            </Card>

            <details className="group rounded-xl border border-hairline bg-surface-1 shadow-el-sm">
              <summary className="cursor-pointer list-none px-6 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-open:rotate-90"><path d="m9 18 6-6-6-6"/></svg>
                  {t("setup.edit")}
                </span>
              </summary>
              <div className="border-t border-hairline px-6 py-5">
                <PlanForm
                  initial={{
                    drugName: plan.drugName,
                    frequency: plan.frequency,
                    doseMg: Number(plan.doseMg),
                    shotDay: plan.shotDay,
                  }}
                />
              </div>
            </details>
          </>
        ) : (
          <Card>
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">{t("setup.title")}</h2>
              <PlanForm initial={null} />
            </div>
          </Card>
        )}
      </main>
    </>
  );
}
