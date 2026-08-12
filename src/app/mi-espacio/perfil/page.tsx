import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { requirePatient } from "@/lib/auth/patient";
import { findLatestAssessment } from "@/modules/assessment/repository";
import { bmiCategory } from "@/modules/assessment/computed";
import { listDocuments } from "@/modules/documents/repository";
import { getOrgProfile } from "@/modules/organization/repository";
import { Topbar } from "@/components/topbar";
import { PatientNav } from "../patient-nav";
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

  const [assessment, documents, org] = await Promise.all([
    findLatestAssessment(patient.id),
    listDocuments(patient.organizationId, patient.id),
    getOrgProfile(patient.organizationId),
  ]);
  const completed = assessment?.status === "COMPLETED";
  const bmiValue = completed ? Number(assessment.bmi) : null;

  return (
    <>
      <Topbar nav={<PatientNav />} />
      <main
        id="contenido"
        className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10"
      >
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
              <Link
                href="/mi-espacio/evaluacion"
                className="w-fit text-sm text-accent-text"
              >
                {t("assessment.review")}
              </Link>
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

        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-full border border-hairline bg-surface-1 px-4 text-sm font-semibold text-ink transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150"
          >
            {t("signOut")}
          </button>
        </form>
      </main>
    </>
  );
}
