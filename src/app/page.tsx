import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import { WeightChart } from "@/components/weight-chart";

export const dynamic = "force-dynamic";

/*
THESIS: the landing IS an annotated patient record - the product proves
itself with its own surfaces; refuses the feature-grid SaaS scroll.
OWN-WORLD: NORTE tokens (inherited app system) - quiet surfaces, hairlines,
one primary accent, Syne display over DM Sans.
STORY: a nutritionist reads a familiar clinical record, recognizes their
daily work, and creates their consulta.
FIRST VIEWPORT: compact hero (badge, H1, sub, 2 CTAs) with the record's
first card already visible below the fold line.
FORM: candidate 5 of 7 (record-as-landing), seed 16a1382a.
FINISH: gates + detector + prod screenshot; DESIGN.md not owed (established world).
*/

// Synthetic weight series for the sample record (labeled "datos de ejemplo").
const SAMPLE_WEIGHTS = [88, 87.6, 87.1, 86.7, 86.2].map((kg, i) => ({
  recordedAt: new Date(Date.UTC(2026, 6, 8 + i * 7, 10)),
  valueKg: kg,
}));

function Annotation({
  title,
  text,
  index,
}: {
  title: string;
  text: string;
  index: number;
}) {
  return (
    <aside className="flex flex-col gap-1.5 lg:sticky lg:top-8 lg:self-start">
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary">
        {index}
      </span>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-subtle">{text}</p>
    </aside>
  );
}

function RecordSection({
  children,
  annotation,
  flip = false,
}: {
  children: ReactNode;
  annotation: ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-10">
      <div className={flip ? "lg:order-2" : ""}>{children}</div>
      <div className={flip ? "lg:order-1" : ""}>{annotation}</div>
    </section>
  );
}

function RecordCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-1 p-6 shadow-el-sm">
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-hairline py-2 last:border-0">
      <dt className="text-sm text-ink-subtle">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function Home() {
  const t = await getTranslations("home");
  const tSlots = await getTranslations("diet.slots");
  const { data: session } = await auth.getSession();

  if (session?.user) {
    const role = await resolveUserRole(session.user.id);
    redirect(roleHome(role));
  }

  const r = (key: string) => t(`record.${key}`);

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-20 pb-14 sm:pt-28">
        <div className="pointer-events-none absolute -inset-40 bg-[radial-gradient(ellipse_at_top,var(--color-primary-subtle)_0%,transparent_60%)]" />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-7 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-4 py-1.5 text-xs font-medium text-ink-subtle shadow-el-sm">
            <span className="size-1.5 rounded-full bg-success" />
            {t("badge")}
          </div>
          <h1 className="text-balance font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t("hero.title")}{" "}
            <span className="text-primary">{t("hero.highlight")}</span>
          </h1>
          <p className="max-w-xl text-balance text-lg text-ink-subtle">
            {t("hero.description")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/sign-up"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-on-primary shadow-el-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-el-md active:scale-[0.97]"
            >
              {t("hero.cta.signUp")}
            </Link>
            <Link
              href="/auth/sign-in"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-hairline bg-surface-1 px-7 text-sm font-semibold text-ink shadow-el-sm transition-all duration-200 hover:border-hairline-strong hover:bg-surface-2 hover:shadow-el-md active:scale-[0.97]"
            >
              {t("hero.cta.signIn")}
            </Link>
          </div>
          <p className="text-xs text-ink-tertiary">{t("hero.scrollHint")} ↓</p>
        </div>
      </div>

      {/* The record */}
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-14 px-6 pb-24">
        {/* Identity */}
        <RecordSection
          annotation={
            <Annotation
              index={1}
              title={r("identity.annotTitle")}
              text={r("identity.annotText")}
            />
          }
        >
          <RecordCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold">{r("patientName")}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success">
                  <span className="size-1.5 rounded-full bg-success" />
                  {r("active")}
                </span>
              </div>
              <span className="rounded-full bg-surface-3 px-2.5 py-0.5 text-xs font-medium text-ink-subtle">
                {t("sample")}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-subtle">{r("email")}</p>
          </RecordCard>
        </RecordSection>

        {/* Clinical assessment */}
        <RecordSection
          flip
          annotation={
            <Annotation
              index={2}
              title={r("clinical.annotTitle")}
              text={r("clinical.annotText")}
            />
          }
        >
          <RecordCard>
            <div className="mb-2 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{r("clinical.title")}</h2>
              <span className="text-sm text-ink-subtle">
                {r("clinical.completed")}
              </span>
            </div>
            <dl className="flex flex-col">
              <Row label={r("clinical.bmi")} value={r("clinical.bmiValue")} />
              <Row label={r("clinical.target")} value="78 kg" />
              <Row
                label={r("clinical.activity")}
                value={r("clinical.activityValue")}
              />
              <Row
                label={r("clinical.goals")}
                value={r("clinical.goalsValue")}
              />
            </dl>
          </RecordCard>
        </RecordSection>

        {/* 28-day report */}
        <RecordSection
          annotation={
            <Annotation
              index={3}
              title={r("report.annotTitle")}
              text={r("report.annotText")}
            />
          }
        >
          <RecordCard>
            <div className="mb-2 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{r("report.title")}</h2>
              <span className="text-sm text-ink-subtle">
                {r("report.window")}
              </span>
            </div>
            <dl className="flex flex-col">
              <Row label={r("report.weight")} value={r("report.weightValue")} />
              <Row
                label={r("report.protein")}
                value={r("report.proteinValue")}
              />
              <Row
                label={r("report.medication")}
                value={r("report.medicationValue")}
              />
              <Row
                label={r("report.training")}
                value={r("report.trainingValue")}
              />
              <Row
                label={r("report.activity")}
                value={r("report.activityValue")}
              />
            </dl>
          </RecordCard>
        </RecordSection>

        {/* Today checklist */}
        <RecordSection
          flip
          annotation={
            <Annotation
              index={4}
              title={r("today.annotTitle")}
              text={r("today.annotText")}
            />
          }
        >
          <RecordCard>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-lg font-semibold">{r("today.title")}</h2>
              <p className="text-sm text-ink-subtle">{r("today.plan")}</p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{r("today.weight")}</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                {r("today.weightDone")}
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium">
                  {r("today.protein")}
                </span>
                <span className="text-sm font-medium tabular-nums text-ink-subtle">
                  {r("today.proteinValue")}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full w-3/4 rounded-full bg-primary"
                  aria-hidden="true"
                />
              </div>
            </div>
          </RecordCard>
        </RecordSection>

        {/* Weight chart */}
        <RecordSection
          annotation={
            <Annotation
              index={5}
              title={r("weightChart.annotTitle")}
              text={r("weightChart.annotText")}
            />
          }
        >
          <RecordCard>
            <h2 className="mb-4 text-lg font-semibold">
              {r("weightChart.title")}
            </h2>
            <WeightChart points={SAMPLE_WEIGHTS} targetKg={78} />
          </RecordCard>
        </RecordSection>

        {/* Diet plan */}
        <RecordSection
          flip
          annotation={
            <Annotation
              index={6}
              title={r("diet.annotTitle")}
              text={r("diet.annotText")}
            />
          }
        >
          <RecordCard>
            <h2 className="mb-3 text-lg font-semibold">{r("diet.title")}</h2>
            <dl className="flex flex-col gap-2.5">
              {(["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as const).map(
                (slot) => (
                  <div key={slot} className="flex flex-col gap-0.5">
                    <dt className="text-xs font-medium text-ink-subtle">
                      {tSlots(slot)}
                    </dt>
                    <dd className="text-sm leading-relaxed">
                      {r(`diet.meals.${slot}`)}
                    </dd>
                  </div>
                ),
              )}
            </dl>
          </RecordCard>
        </RecordSection>

        {/* Training */}
        <RecordSection
          annotation={
            <Annotation
              index={7}
              title={r("training.annotTitle")}
              text={r("training.annotText")}
            />
          }
        >
          <RecordCard>
            <h2 className="mb-2 text-lg font-semibold">
              {r("training.title")}
            </h2>
            <p className="text-sm leading-relaxed">{r("training.content")}</p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-success-soft px-4 py-2 text-sm font-medium text-success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
              {r("training.done")}
            </p>
          </RecordCard>
        </RecordSection>

        {/* GLP-1 */}
        <RecordSection
          flip
          annotation={
            <Annotation
              index={8}
              title={r("glp1.annotTitle")}
              text={r("glp1.annotText")}
            />
          }
        >
          <RecordCard>
            <h2 className="mb-2 text-lg font-semibold">{r("glp1.title")}</h2>
            <p className="text-xl font-semibold">{r("glp1.next")}</p>
            <p className="mt-1 text-sm text-ink-subtle">{r("glp1.drug")}</p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-dashed border-primary px-4 py-1.5 text-sm">
              {r("glp1.site")}
            </p>
          </RecordCard>
        </RecordSection>

        {/* Messages + agenda */}
        <RecordSection
          annotation={
            <Annotation
              index={9}
              title={r("comms.annotTitle")}
              text={r("comms.annotText")}
            />
          }
        >
          <RecordCard>
            <h2 className="mb-3 text-lg font-semibold">{r("comms.title")}</h2>
            <div className="flex flex-col gap-2.5">
              <div className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-2 text-sm leading-relaxed">
                {r("comms.messagePatient")}
              </div>
              <div className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm leading-relaxed text-on-primary">
                {r("comms.messageSpecialist")}
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 border-t border-hairline pt-3 text-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-subtle"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              {r("comms.cita")}
            </p>
          </RecordCard>
        </RecordSection>

        {/* Privacy */}
        <RecordSection
          flip
          annotation={
            <Annotation
              index={10}
              title={r("privacy.annotTitle")}
              text={r("privacy.annotText")}
            />
          }
        >
          <RecordCard>
            <h2 className="mb-3 text-lg font-semibold">
              {r("privacy.title")}
            </h2>
            <ul className="flex flex-col gap-2.5">
              {(["isolation", "blind", "rights", "eu"] as const).map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0 text-success"><path d="M20 6 9 17l-5-5"/></svg>
                  {r(`privacy.items.${key}`)}
                </li>
              ))}
            </ul>
          </RecordCard>
        </RecordSection>
      </div>

      {/* Closing CTA */}
      <div className="border-t border-hairline bg-surface-1 px-6 py-20">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 text-center">
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight">
            {t("closing.title")}
          </h2>
          <p className="max-w-lg text-balance text-ink-subtle">
            {t("closing.text")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/sign-up"
              className="inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm font-semibold text-on-primary shadow-el-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-el-md active:scale-[0.97]"
            >
              {t("closing.cta")}
            </Link>
            <Link
              href="/auth/sign-in"
              className="text-sm font-medium text-ink-subtle underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {t("closing.secondary")}
            </Link>
          </div>
        </div>
      </div>

      <footer className="px-6 py-8 text-center text-xs text-ink-tertiary">
        &copy; {new Date().getFullYear()} Nutrionyx
      </footer>
    </main>
  );
}
