import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { getPatientDetail } from "@/modules/patient/repository";
import { ageInYears } from "@/modules/patient/age";
import { listWeights } from "@/modules/measurement/repository";
import { bmiCategory } from "@/modules/assessment/computed";
import { ConsoleShell } from "@/components/console-shell";
import { Card } from "@/components/ui/card";
import { WeightChart } from "@/components/weight-chart";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-hairline px-4 py-2.5 last:border-0 even:bg-surface-2/50">
      <dt className="text-sm text-ink-subtle">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
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

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  const role = await resolveUserRole(session.user.id);
  if (role !== "nutritionist") {
    redirect(roleHome(role));
  }

  const { data: organizations } = await auth.organization.list();
  if (!organizations || organizations.length === 0) {
    redirect("/panel/nueva-organizacion");
  }
  const active = organizations[0];
  const org = await ensureOrganization(active.id, active.name);

  // Org-scoped: a patient id from another consulta resolves to nothing → 404.
  const patient = await getPatientDetail(org.id, id);
  if (!patient) {
    notFound();
  }

  const assessment = patient.assessments[0] ?? null;
  const weights = await listWeights(org.id, patient.id);
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
    <ConsoleShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href="/panel/pacientes"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-subtle no-underline transition-colors hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            {t("back")}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{patient.fullName}</h1>
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

        <Card>
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

        <Card>
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">{t("weight.title")}</h2>
            {points.length > 0 ? (
              <WeightChart points={points} targetKg={targetKg} />
            ) : (
              <p className="text-sm text-ink-subtle">{t("weight.empty")}</p>
            )}
          </div>
        </Card>
      </div>
    </ConsoleShell>
  );
}
