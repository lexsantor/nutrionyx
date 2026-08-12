import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import { WeightChart } from "@/components/weight-chart";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "./reveal";
import { BodySilhouette } from "@/components/body-silhouette";

export const dynamic = "force-dynamic";

/*
THESIS: an AI-SEO answer page whose proof block IS the product - question
H1 answered in-line, 40-60 word answer above the fold, question
sub-headings, honest comparison, FAQ with schema; the annotated synthetic
record survives as the proof section (compacted to 8 varied beats).
OWN-WORLD: NORTE tokens - soft structuralism, double-bezel clinical cards,
one primary accent, Syne display.
STORY: a nutritionist recognizes their problem in their own words, reads a
real record, checks the FAQ, creates their consulta.
FIRST VIEWPORT: question H1 + short answer highlight, byline + last-updated
stamp, answer block, dual CTA; floating pill nav.
FORM: record-as-proof inside the 14-block answer-page pattern (owner brief).
FINISH: gates + detector + prod check; no fabricated claims anywhere.
*/

const LAST_UPDATED_ISO = "2026-08-10";

const SAMPLE_WEIGHTS = [88, 87.6, 87.1, 86.7, 86.2].map((kg, i) => ({
  recordedAt: new Date(Date.UTC(2026, 6, 8 + i * 7, 10)),
  valueKg: kg,
}));

const EASE = "ease-house";

function Bezel({
  children,
  tilt = "",
  className = "",
}: {
  children: ReactNode;
  tilt?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2rem] border border-hairline bg-ink/[0.04] p-1.5 shadow-el-bezel transition-transform duration-500 hover:duration-700 ${EASE} ${tilt} ${className}`}
    >
      <div className="rounded-[calc(2rem-0.375rem)] bg-surface-1 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        {children}
      </div>
    </div>
  );
}

function CtaButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-7 pr-2 text-sm font-semibold text-on-primary no-underline shadow-el-md transition-[transform,box-shadow,border-color,background-color,color] duration-200 ${EASE} hover:bg-primary-hover hover:shadow-el-lg active:scale-[0.98] active:duration-150`}
    >
      {children}
      <span
        className={`flex size-9 items-center justify-center rounded-full bg-canvas/20 transition-transform duration-500 ${EASE} group-hover:-translate-y-px group-hover:translate-x-1 group-hover:scale-105`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
      </span>
    </Link>
  );
}

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
    <aside className="flex flex-col gap-2 lg:sticky lg:top-28 lg:self-start">
      <span className="inline-flex size-7 items-center justify-center rounded-full border border-hairline bg-surface-1 font-display text-xs font-semibold shadow-el-sm">
        {index}
      </span>
      <h3 className="font-display text-lg font-semibold tracking-tight">
        {title}
      </h3>
      <p className="max-w-[36ch] text-sm leading-relaxed text-ink-subtle">
        {text}
      </p>
    </aside>
  );
}

function RecordSection({
  children,
  annotation,
  flip = false,
  tilt,
}: {
  children: ReactNode;
  annotation: ReactNode;
  flip?: boolean;
  tilt: string;
}) {
  // order-* moves the item, not the track: the template must flip with it
  // so the record card always lands in the fluid column (audit 2026-08-12).
  const tracks = flip
    ? "lg:grid-cols-[280px_minmax(0,1fr)]"
    : "lg:grid-cols-[minmax(0,1fr)_280px]";
  return (
    <section className={`grid items-start gap-6 ${tracks} lg:gap-16`}>
      <Reveal className={flip ? "lg:order-2" : ""}>
        <Bezel tilt={`${tilt} hover:rotate-0`}>{children}</Bezel>
      </Reveal>
      <Reveal delay={80} className={flip ? "lg:order-1" : ""}>
        {annotation}
      </Reveal>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-hairline py-2.5 last:border-0">
      <dt className="text-sm text-ink-subtle">{label}</dt>
      <dd className="text-right text-sm font-medium tabular-nums">{value}</dd>
    </div>
  );
}

const SampleChip = ({ label }: { label: string }) => (
  <span className="rounded-md bg-surface-3 px-2 py-0.5 text-xs font-medium text-ink-muted">
    {label}
  </span>
);

export default async function Home() {
  const t = await getTranslations("home");
  const tSlots = await getTranslations("diet.slots");
  const { data: session } = await auth.getSession();

  if (session?.user) {
    const role = await resolveUserRole(session.user.id);
    redirect(roleHome(role));
  }

  const r = (key: string) => t(`record.${key}`);
  const faqKeys = [
    "gdpr",
    "patient",
    "onboarding",
    "glp1",
    "card",
    "export",
  ] as const;
  const comparisonKeys = [
    "adherence",
    "diet",
    "history",
    "privacy",
    "reminders",
    "place",
  ] as const;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Nutrionyx",
        url: "https://nutrionyx.vercel.app",
      },
      {
        "@type": "SoftwareApplication",
        name: "Nutrionyx",
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        inLanguage: "es",
        dateModified: LAST_UPDATED_ISO,
        description: t("hero.answer"),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqKeys.map((key) => ({
          "@type": "Question",
          name: t(`faq.items.${key}.q`),
          acceptedAnswer: {
            "@type": "Answer",
            text: t(`faq.items.${key}.a`),
          },
        })),
      },
    ],
  };

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Film grain, fixed and inert */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.025] mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Floating pill nav */}
      <nav className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center px-4">
        <div className="pointer-events-auto mt-5 flex w-max items-center gap-5 rounded-full border border-hairline bg-canvas/70 py-2 pl-5 pr-2 shadow-el-md backdrop-blur-xl">
          <span className="font-display text-sm font-semibold tracking-tight">
            Nutrionyx
          </span>
          <ButtonLink
            href="/auth/sign-in"
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            {t("hero.cta.signIn")}
          </ButtonLink>
          <ButtonLink href="/auth/sign-up" variant="primary" size="sm">
            {t("hero.cta.signUp")}
          </ButtonLink>
        </div>
      </nav>

      {/* Blocks 1-5: question H1, byline, subheadline, answer, CTA */}
      <header className="relative overflow-hidden px-6 pb-20 pt-36 sm:pt-44">
        <div className="pointer-events-none absolute -inset-x-40 -top-64 h-[42rem] bg-[radial-gradient(ellipse_at_top,var(--color-primary-subtle)_0%,transparent_65%)]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_20%,black,transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(var(--c-hairline) 1px, transparent 1px), linear-gradient(90deg, var(--c-hairline) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="flex flex-col items-start gap-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-ink-subtle shadow-el-sm">
              <span className="size-1.5 rounded-full bg-success" />
              {t("badge")}
            </div>
            <h1 className="max-w-[24ch] text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
              {t("hero.title")}{" "}
              <span className="rounded-xl bg-primary-subtle px-2 text-on-primary-subtle">
                {t("hero.highlight")}
              </span>
            </h1>
            <p className="text-lg font-medium">{t("hero.subtitle")}</p>
            <p className="max-w-[62ch] text-pretty leading-relaxed text-ink-subtle">
              {t("hero.answer")}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <CtaButton href="/auth/sign-up">{t("hero.cta.signUp")}</CtaButton>
              <ButtonLink
                href="/auth/sign-in"
                variant="secondary"
                size="lg"
              >
                {t("hero.cta.signIn")}
              </ButtonLink>
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
              <span>{t("hero.byline")}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={LAST_UPDATED_ISO}>{t("hero.updated")}</time>
            </p>
          </div>

          {/* Floating record teaser stack */}
          <div className="relative mx-auto hidden h-[26rem] w-full max-w-sm lg:block" aria-hidden="true">
            <div
              className="absolute left-1/2 top-0 w-56 -translate-x-[85%] rounded-[1.5rem] border border-hairline bg-ink/[0.04] p-1.5 shadow-el-bezel [--tilt:-5deg]"
              style={{ animation: "float 8s ease-in-out infinite" }}
            >
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-surface-1 p-4">
                <p className="text-xs font-medium text-ink-subtle">
                  {r("today.title")}
                </p>
                <p className="mt-1 text-sm font-semibold">{r("today.plan")}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full w-3/4 rounded-full bg-primary" />
                </div>
              </div>
            </div>
            <div
              className="absolute left-1/2 top-16 z-10 w-60 -translate-x-[15%] rounded-[1.5rem] border border-hairline bg-ink/[0.04] p-1.5 shadow-el-bezel [--tilt:3deg]"
              style={{ animation: "float 9s ease-in-out 0.8s infinite" }}
            >
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-surface-1 p-4 text-ink">
                <p className="text-xs font-medium text-ink-subtle">
                  {r("weightChart.title")}
                </p>
                <svg viewBox="0 0 200 300" className="mx-auto mt-2 h-48 w-auto">
                  <BodySilhouette view="front" />
                  <line x1="58" y1="152" x2="142" y2="152" strokeWidth="2" className="stroke-primary" />
                  <circle cx="142" cy="152" r="3.5" className="fill-primary" />
                  <line x1="51" y1="196" x2="149" y2="196" strokeWidth="2" className="stroke-ink/40" />
                </svg>
              </div>
            </div>
            <div
              className="absolute bottom-0 left-1/2 w-52 -translate-x-[60%] rounded-[1.5rem] border border-hairline bg-ink/[0.04] p-1.5 shadow-el-bezel [--tilt:5deg]"
              style={{ animation: "float 7s ease-in-out 1.6s infinite" }}
            >
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-surface-1 p-4">
                <p className="text-xs font-medium text-ink-subtle">
                  {r("glp1.title")}
                </p>
                <p className="mt-1 text-sm font-semibold">{r("glp1.next")}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Block 7: the problem, in their words */}
      <section className="px-6 py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <h2 className="max-w-[30ch] text-balance font-display text-3xl font-semibold tracking-tight">
            {t("problem.heading")}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {(
              [
                { key: "whatsapp", icon: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 20l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8Z" },
                { key: "excel", icon: "M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" },
                { key: "pdf", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6" },
              ] as const
            ).map((item, i) => (
              <Reveal key={item.key} delay={i * 60}>
                <div className="flex h-full flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-5 shadow-el-sm">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-surface-3 text-ink-subtle">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.icon} /></svg>
                  </span>
                  <p className="text-sm leading-relaxed">
                    {t(`problem.items.${item.key}`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="max-w-[68ch] leading-relaxed text-ink-subtle">
            {t("problem.cost")}
          </p>
        </div>
      </section>

      {/* Block 9: the solution, closing on one next step */}
      <section className="border-y border-hairline bg-surface-1 px-6 py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          <h2 className="max-w-[30ch] text-balance font-display text-3xl font-semibold tracking-tight">
            {t("solution.heading")}
          </h2>
          <p className="max-w-[68ch] leading-relaxed text-ink-subtle">
            {t("solution.text")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm font-medium">{t("solution.next")}</p>
            <CtaButton href="/auth/sign-up">{t("hero.cta.signUp")}</CtaButton>
          </div>
        </div>
      </section>

      {/* Block 11: proof - the annotated record, 8 varied beats */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 pt-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          {t("proofHeading")}
        </h2>
        <p className="max-w-[68ch] text-ink-subtle">{t("proofSub")}</p>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-24 pt-12 lg:gap-24">
        <div className="pointer-events-none absolute -right-64 top-1/3 -z-10 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,var(--color-primary-subtle)_0%,transparent_70%)]" />
        <RecordSection
          tilt="lg:-rotate-1"
          annotation={
            <Annotation
              index={1}
              title={r("identity.annotTitle")}
              text={r("identity.annotText")}
            />
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {r("patientName")}
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success">
                <span className="size-1.5 rounded-full bg-success" />
                {r("active")}
              </span>
            </div>
            <SampleChip label={t("sample")} />
          </div>
          <p className="mt-1 text-sm text-ink-subtle">{r("email")}</p>
          <dl className="mt-4 flex flex-col">
            <Row label={r("clinical.bmi")} value={r("clinical.bmiValue")} />
            <Row label={r("clinical.target")} value="78 kg" />
            <Row label={r("clinical.goals")} value={r("clinical.goalsValue")} />
          </dl>
        </RecordSection>

        <RecordSection
          flip
          tilt="lg:rotate-1"
          annotation={
            <Annotation
              index={2}
              title={r("report.annotTitle")}
              text={r("report.annotText")}
            />
          }
        >
          <div className="mb-2 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">{r("report.title")}</h3>
            <span className="flex items-center gap-2 text-sm text-ink-subtle">
              {r("report.window")} <SampleChip label={t("sample")} />
            </span>
          </div>
          <dl className="flex flex-col">
            <Row label={r("report.weight")} value={r("report.weightValue")} />
            <Row label={r("report.protein")} value={r("report.proteinValue")} />
            <Row
              label={r("report.medication")}
              value={r("report.medicationValue")}
            />
            <Row
              label={r("report.training")}
              value={r("report.trainingValue")}
            />
          </dl>
        </RecordSection>

        {/* Full-width beat: the chart breaks the column rhythm */}
        <Reveal>
          <Bezel tilt="lg:rotate-[0.4deg] hover:rotate-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold">
                {r("weightChart.title")}
              </h3>
              <SampleChip label={t("sample")} />
            </div>
            <WeightChart points={SAMPLE_WEIGHTS} targetKg={78} />
          </Bezel>
        </Reveal>

        <RecordSection
          tilt="lg:-rotate-[0.8deg]"
          annotation={
            <Annotation
              index={3}
              title={r("today.annotTitle")}
              text={r("today.annotText")}
            />
          }
        >
          <div className="flex flex-col gap-0.5">
            <h3 className="text-lg font-semibold">{r("today.title")}</h3>
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
              <span className="text-sm font-medium">{r("today.protein")}</span>
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
        </RecordSection>

        <RecordSection
          flip
          tilt="lg:rotate-[0.7deg]"
          annotation={
            <Annotation
              index={4}
              title={r("planCare.annotTitle")}
              text={r("planCare.annotText")}
            />
          }
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <h3 className="text-lg font-semibold">{r("diet.title")}</h3>
              {(["LUNCH", "DINNER"] as const).map((slot) => (
                <div key={slot} className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-ink-subtle">
                    {tSlots(slot)}
                  </span>
                  <span className="text-sm leading-relaxed">
                    {r(`diet.meals.${slot}`)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <h3 className="text-lg font-semibold">{r("training.title")}</h3>
              <p className="text-sm leading-relaxed">{r("training.content")}</p>
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-success-soft px-4 py-2 text-sm font-medium text-success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                {r("training.done")}
              </p>
            </div>
          </div>
        </RecordSection>

        <RecordSection
          tilt="lg:-rotate-[0.6deg]"
          annotation={
            <Annotation
              index={5}
              title={r("glp1.annotTitle")}
              text={r("glp1.annotText")}
            />
          }
        >
          <h3 className="mb-2 text-lg font-semibold">{r("glp1.title")}</h3>
          <p className="font-display text-xl font-semibold">{r("glp1.next")}</p>
          <p className="mt-1 text-sm text-ink-subtle">{r("glp1.drug")}</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-dashed border-primary px-4 py-1.5 text-sm">
            {r("glp1.site")}
          </p>
        </RecordSection>

        <RecordSection
          flip
          tilt="lg:rotate-[0.8deg]"
          annotation={
            <Annotation
              index={6}
              title={r("comms.annotTitle")}
              text={r("comms.annotText")}
            />
          }
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">{r("comms.title")}</h3>
            <SampleChip label={t("sample")} />
          </div>
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
        </RecordSection>

        <RecordSection
          tilt="lg:-rotate-[0.7deg]"
          annotation={
            <Annotation
              index={7}
              title={r("privacy.annotTitle")}
              text={r("privacy.annotText")}
            />
          }
        >
          <h3 className="mb-3 text-lg font-semibold">{r("privacy.title")}</h3>
          <ul className="flex flex-col gap-2.5">
            {(["isolation", "blind", "rights", "eu"] as const).map((key) => (
              <li
                key={key}
                className="flex items-start gap-2.5 text-sm leading-relaxed"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0 text-ink-subtle"><path d="M20 6 9 17l-5-5"/></svg>
                {r(`privacy.items.${key}`)}
              </li>
            ))}
          </ul>
        </RecordSection>
      </div>

      {/* Block 12: honest comparison against the current method */}
      <section className="border-t border-hairline bg-surface-1 px-6 py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <h2 className="max-w-[30ch] text-balance font-display text-3xl font-semibold tracking-tight">
            {t("comparison.heading")}
          </h2>
          <div className="w-full overflow-x-auto rounded-xl border border-hairline">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline bg-surface-2 text-ink-subtle">
                  <th scope="col" className="px-4 py-3 font-medium" />
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("comparison.current")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">
                    {t("comparison.product")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonKeys.map((key) => (
                  <tr
                    key={key}
                    className="border-b border-hairline last:border-0"
                  >
                    <th scope="row" className="px-4 py-3 font-medium text-ink">
                      {t(`comparison.rows.${key}.label`)}
                    </th>
                    <td className="px-4 py-3 text-ink-subtle">
                      {t(`comparison.rows.${key}.current`)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {t(`comparison.rows.${key}.product`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Block 8: FAQ (schema in head via JSON-LD) */}
      <section className="px-6 py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-x-16 gap-y-8 lg:grid-cols-2">
          <h2 className="max-w-[30ch] text-balance font-display text-3xl font-semibold tracking-tight lg:col-span-2">
            {t("faq.heading")}
          </h2>
          {faqKeys.map((key) => (
            <div key={key} className="flex flex-col gap-2">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                {t(`faq.items.${key}.q`)}
              </h3>
              <p className="max-w-[62ch] text-sm leading-relaxed text-ink-subtle">
                {t(`faq.items.${key}.a`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Block 13: closing CTA in plain words */}
      <div className="border-t border-hairline bg-surface-1 px-6 py-24">
        <Reveal className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 text-center">
          <h2 className="text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("closing.title")}
          </h2>
          <p className="max-w-[48ch] text-balance leading-relaxed text-ink-subtle">
            {t("closing.text")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <CtaButton href="/auth/sign-up">{t("closing.cta")}</CtaButton>
            <ButtonLink
              href="/auth/sign-in"
              variant="secondary"
              size="lg"
            >
              {t("closing.secondary")}
            </ButtonLink>
          </div>
          <p className="text-xs text-ink-subtle">{t("closing.noCard")}</p>
        </Reveal>
      </div>

      {/* Block 14: visible last-updated stamp */}
      <footer className="flex flex-col items-center gap-2 px-6 py-10 text-center text-xs text-ink-subtle">
        <div className="flex items-center gap-3">
          <Link
            href="/privacidad"
            className="font-medium text-ink-subtle transition-colors duration-200 hover:text-ink"
          >
            {t("footer.privacy")}
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/terminos"
            className="font-medium text-ink-subtle transition-colors duration-200 hover:text-ink"
          >
            {t("footer.terms")}
          </Link>
        </div>
        <span>&copy; {new Date().getFullYear()} Nutrionyx</span>
        <time dateTime={LAST_UPDATED_ISO}>{t("hero.updated")}</time>
      </footer>
    </main>
  );
}
