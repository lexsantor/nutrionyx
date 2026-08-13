import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { requirePatient } from "@/lib/auth/patient";
import { findLatestAssessment } from "@/modules/assessment/repository";
import { bmiCategory } from "@/modules/assessment/computed";
import { ASSESSMENT_STEPS } from "@/modules/assessment/definition";
import { listDocuments } from "@/modules/documents/repository";
import { getOrgProfile } from "@/modules/organization/repository";
import { getPlan } from "@/modules/medication/repository";
import { signOut } from "@/lib/auth/sign-out";

export const metadata = { title: "Mi perfil" };
export const dynamic = "force-dynamic";

const TILE =
  "flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6 shadow-el-sm";

/**
 * The patient's own account (docs/build/navigation-audit.md, tier 2). Their
 * data, the assessment they filled in, the documents their consulta shared,
 * and the two rights that were living in a link at the foot of the home
 * page: taking their data with them, and asking for it to be erased.
 */
export default async function PatientProfilePage() {
  const t = await getTranslations("patientProfile");
  const th = await getTranslations("patientHome");
  const td = await getTranslations("documents");
  const format = await getFormatter();
  const { name, patient } = await requirePatient();

  const [assessment, documents, org, medicationPlan] = await Promise.all([
    findLatestAssessment(patient.id),
    listDocuments(patient.organizationId, patient.id),
    getOrgProfile(patient.organizationId),
    getPlan(patient.organizationId, patient.id),
  ]);
  const completed = assessment?.status === "COMPLETED";
  const bmiValue = completed ? Number(assessment.bmi) : null;

  /**
   * The answers, read-only. They used to be unreachable once the wizard
   * finished: /mi-espacio/evaluacion redirects a completed assessment
   * straight back out, so a "review my answers" link there would bounce.
   * Showing them here needs no navigation at all.
   */
  const tw = await getTranslations("wizard");
  const answers = completed
    ? ASSESSMENT_STEPS.map((step) => {
        const raw = (assessment as unknown as Record<string, unknown>)[
          step.field
        ];
        if (raw === null || raw === undefined) return null;
        let display: string;
        if (step.field === "sex" || step.field === "activityLevel") {
          display = tw(`options.${step.field}.${String(raw)}`);
        } else if (Array.isArray(raw)) {
          if (raw.length === 0) return null;
          display =
            step.field === "goals"
              ? raw.map((g) => tw(`options.goals.${String(g)}`)).join(", ")
              : raw.map(String).join(", ");
        } else if (raw instanceof Date) {
          display = format.dateTime(raw, { dateStyle: "long" });
        } else {
          display = String(raw);
          if (display.length === 0) return null;
        }
        return { field: step.field, display };
      }).filter((entry) => entry !== null)
    : [];

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
          <h2 className="text-lg font-semibold">{t("account.title")}</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
              <dt className="text-ink-subtle">{t("account.name")}</dt>
              <dd className="font-medium">{patient.fullName ?? name}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
              <dt className="text-ink-subtle">{t("account.email")}</dt>
              <dd className="font-medium">{patient.email}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
              <dt className="text-ink-subtle">{t("account.consulta")}</dt>
              <dd className="font-medium">{org?.name ?? t("account.unknownConsulta")}</dd>
            </div>
          </dl>
          {/* Changing these is the consulta's job: the specialist owns the
              clinical record, so a self-service edit here would fork it. */}
          <p className="text-xs text-ink-subtle">{t("account.changeHint")}</p>
        </section>

        <section className={TILE}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-lg font-semibold">{t("assessment.title")}</h2>
            {completed ? (
              <p className="text-sm text-ink-subtle">
                {th("summary.completedAt", {
                  date: format.dateTime(assessment.completedAt!, {
                    dateStyle: "long",
                  }),
                })}
              </p>
            ) : null}
          </div>
          {completed ? (
            <>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-subtle">{th("summary.bmi")}</dt>
                  <dd className="font-semibold tabular-nums">
                    {bmiValue} · {th(`bmiCategories.${bmiCategory(bmiValue!)}`)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-subtle">{th("summary.goal")}</dt>
                  <dd className="font-semibold tabular-nums">
                    {Number(assessment.targetWeightKg)} kg
                  </dd>
                </div>
              </dl>
              {answers.length > 0 ? (
                <details className="group border-t border-hairline pt-3">
                  <summary className="w-fit cursor-pointer list-none text-sm text-accent-text">
                    <span className="group-open:hidden">
                      {t("assessment.review")}
                    </span>
                    <span className="hidden group-open:inline">
                      {t("assessment.hideReview")}
                    </span>
                  </summary>
                  <dl className="mt-3 flex flex-col gap-2 text-sm">
                    {answers.map((entry) => (
                      <div
                        key={entry.field}
                        className="flex flex-col gap-0.5 border-b border-hairline pb-2 last:border-0"
                      >
                        <dt className="text-xs text-ink-subtle">
                          {tw(`fields.${entry.field}.title`)}
                        </dt>
                        <dd className="font-medium">{entry.display}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm text-ink-subtle">{t("assessment.pending")}</p>
              <Link
                href="/mi-espacio/evaluacion"
                className="w-fit text-sm text-accent-text"
              >
                {t("assessment.continue")}
              </Link>
            </>
          )}
        </section>

        <section className={TILE}>
          <h2 className="text-lg font-semibold">{td("title")}</h2>
          {documents.length === 0 ? (
            <p className="text-sm text-ink-subtle">{t("documents.empty")}</p>
          ) : (
            <ul className="flex flex-col">
              {documents.map((doc) => (
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
          )}
        </section>

        <section className={TILE}>
          <h2 className="text-lg font-semibold">{t("data.title")}</h2>
          <div className="flex flex-col gap-1.5">
            <a
              href="/api/me/export"
              download
              className="inline-flex h-9 w-fit items-center rounded-full border border-hairline bg-surface-1 px-4 text-sm font-semibold text-ink no-underline transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150"
            >
              {t("data.export")}
            </a>
            <p className="text-xs text-ink-subtle">{t("data.exportHint")}</p>
          </div>
          <div className="flex flex-col gap-1.5 border-t border-hairline pt-4">
            <h3 className="text-sm font-semibold">{t("data.erasureTitle")}</h3>
            {/* No button: the consulta is the data controller and holds the
                clinical record, so erasure is their action to take. Saying
                so beats a control that would only file a ticket. */}
            <p className="text-xs text-ink-subtle">
              {t("data.erasureHint", {
                consulta: org?.name ?? t("account.unknownConsulta"),
              })}
            </p>
            <Link
              href="/mi-espacio/mensajes"
              className="w-fit text-sm text-accent-text"
            >
              {t("data.erasureCta")}
            </Link>
          </div>
        </section>

        {medicationPlan === null ? (
          /* The only door to medication for a patient who has none: the nav
             entry appears once a plan exists, so without this the feature
             would be unreachable. */
          <section className={TILE}>
            <h2 className="text-lg font-semibold">{t("medication.title")}</h2>
            <p className="text-sm text-ink-subtle">{t("medication.text")}</p>
            <Link
              href="/mi-espacio/medicacion"
              className="w-fit text-sm text-accent-text"
            >
              {t("medication.cta")}
            </Link>
          </section>
        ) : null}

        <form action={signOut}>
          <Button type="submit" variant="secondary">
            {t("signOut")}
          </Button>
        </form>
      </div>
    </>
  );
}
