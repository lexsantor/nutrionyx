import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import { WeightChart } from "@/components/weight-chart";
import { Reveal } from "./reveal";

export const dynamic = "force-dynamic";

/*
THESIS: the landing IS an annotated patient record - the product proves
itself with its own surfaces; refuses the feature-grid SaaS scroll.
OWN-WORLD: NORTE tokens elevated - soft structuralism (airy light ground,
massive Syne display, diffused ambient shadows), double-bezel clinical
cards stacked with physical z-axis tilt, one primary accent.
STORY: a nutritionist reads a familiar clinical record, recognizes their
daily work, and creates their consulta.
FIRST VIEWPORT: editorial split - massive type + CTAs left, tilted record
card stack right; floating pill nav detached from the top.
FORM: candidate 5 of 7 (record-as-landing), seed 16a1382a; elevation pass
with high-end-visual-design + redesign audit.
FINISH: gates + detector + prod check; DESIGN.md not owed (established world).
*/

const SAMPLE_WEIGHTS = [88, 87.6, 87.1, 86.7, 86.2].map((kg, i) => ({
  recordedAt: new Date(Date.UTC(2026, 6, 8 + i * 7, 10)),
  valueKg: kg,
}));

const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

/** Double-bezel clinical card: outer machined shell, concentric inner core. */
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
      className={`rounded-[2rem] border border-hairline bg-ink/[0.04] p-1.5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.25)] transition-transform duration-700 ${EASE} ${tilt} ${className}`}
    >
      <div className="rounded-[calc(2rem-0.375rem)] bg-surface-1 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        {children}
      </div>
    </div>
  );
}

/** Primary CTA with the nested trailing-icon island. */
function CtaButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-7 pr-2 text-sm font-semibold text-on-primary shadow-el-md transition-all duration-500 ${EASE} hover:bg-primary-hover hover:shadow-el-lg active:scale-[0.98]`}
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
  return (
    <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
      <Reveal className={flip ? "lg:order-2" : ""}>
        <Bezel tilt={`${tilt} hover:rotate-0`}>{children}</Bezel>
      </Reveal>
      <Reveal delay={120} className={flip ? "lg:order-1" : ""}>
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
    <main className="relative flex min-h-[100dvh] flex-col overflow-x-clip">
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
          <Link
            href="/auth/sign-in"
            className="hidden text-sm text-ink-subtle transition-colors hover:text-ink sm:block"
          >
            {t("hero.cta.signIn")}
          </Link>
          <Link
            href="/auth/sign-up"
            className={`inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-on-primary transition-all duration-500 ${EASE} hover:bg-primary-hover active:scale-[0.98]`}
          >
            {t("hero.cta.signUp")}
          </Link>
        </div>
      </nav>

      {/* Hero: editorial split */}
      <div className="relative px-6 pb-24 pt-36 sm:pt-44 lg:pb-32">
        <div className="pointer-events-none absolute -inset-x-40 -top-64 h-[42rem] bg-[radial-gradient(ellipse_at_top,var(--color-primary-subtle)_0%,transparent_65%)]" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="flex flex-col items-start gap-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-subtle shadow-el-sm">
              <span className="size-1.5 rounded-full bg-success" />
              {t("badge")}
            </div>
            <h1 className="text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
              {t("hero.title")}{" "}
              <span className="text-primary">{t("hero.highlight")}</span>
            </h1>
            <p className="max-w-[52ch] text-pretty text-lg leading-relaxed text-ink-subtle">
              {t("hero.description")}
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <CtaButton href="/auth/sign-up">{t("hero.cta.signUp")}</CtaButton>
              <Link
                href="/auth/sign-in"
                className="text-sm font-medium text-ink-subtle underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                {t("hero.cta.signIn")}
              </Link>
            </div>
          </div>

          {/* Tilted record teaser stack (z-axis cascade) */}
          <div className="relative mx-auto hidden w-full max-w-md lg:block" aria-hidden="true">
            <div className={`absolute -left-6 top-10 w-64 -rotate-6 rounded-[1.5rem] border border-hairline bg-ink/[0.04] p-1.5 shadow-[0_32px_70px_-30px_rgba(15,23,42,0.35)] transition-transform duration-700 ${EASE} hover:-rotate-3`}>
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
            <div className={`relative z-10 ml-16 w-72 rotate-2 rounded-[1.5rem] border border-hairline bg-ink/[0.04] p-1.5 shadow-[0_40px_90px_-32px_rgba(15,23,42,0.4)] transition-transform duration-700 ${EASE} hover:rotate-0`}>
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-surface-1 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{r("patientName")}</p>
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-medium text-success">
                    {r("active")}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  {r("report.weightValue")}
                </p>
                <div className="mt-3">
                  <WeightChart points={SAMPLE_WEIGHTS} targetKg={78} />
                </div>
              </div>
            </div>
            <div className={`absolute -bottom-8 right-0 w-56 rotate-[5deg] rounded-[1.5rem] border border-hairline bg-ink/[0.04] p-1.5 shadow-[0_28px_60px_-28px_rgba(15,23,42,0.35)] transition-transform duration-700 ${EASE} hover:rotate-2`}>
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-surface-1 p-4">
                <p className="text-xs font-medium text-ink-subtle">
                  {r("glp1.title")}
                </p>
                <p className="mt-1 text-sm font-semibold">{r("glp1.next")}</p>
              </div>
            </div>
          </div>
        </div>
        <p className="relative mt-20 text-center text-xs uppercase tracking-[0.2em] text-ink-tertiary">
          {t("hero.scrollHint")} ↓
        </p>
      </div>

      {/* The record */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-24 px-6 pb-32 lg:gap-32">
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
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {r("patientName")}
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success">
                <span className="size-1.5 rounded-full bg-success" />
                {r("active")}
              </span>
            </div>
            <span className="rounded-md bg-surface-3 px-2.5 py-0.5 text-xs font-medium text-ink-subtle">
              {t("sample")}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-subtle">{r("email")}</p>
        </RecordSection>

        <RecordSection
          flip
          tilt="lg:rotate-1"
          annotation={
            <Annotation
              index={2}
              title={r("clinical.annotTitle")}
              text={r("clinical.annotText")}
            />
          }
        >
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
            <Row label={r("clinical.goals")} value={r("clinical.goalsValue")} />
          </dl>
        </RecordSection>

        <RecordSection
          tilt="lg:-rotate-[0.7deg]"
          annotation={
            <Annotation
              index={3}
              title={r("report.annotTitle")}
              text={r("report.annotText")}
            />
          }
        >
          <div className="mb-2 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">{r("report.title")}</h2>
            <span className="text-sm text-ink-subtle">{r("report.window")}</span>
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
            <Row
              label={r("report.activity")}
              value={r("report.activityValue")}
            />
          </dl>
        </RecordSection>

        <RecordSection
          flip
          tilt="lg:rotate-[0.8deg]"
          annotation={
            <Annotation
              index={4}
              title={r("today.annotTitle")}
              text={r("today.annotText")}
            />
          }
        >
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
          tilt="lg:-rotate-1"
          annotation={
            <Annotation
              index={5}
              title={r("weightChart.annotTitle")}
              text={r("weightChart.annotText")}
            />
          }
        >
          <h2 className="mb-4 text-lg font-semibold">
            {r("weightChart.title")}
          </h2>
          <WeightChart points={SAMPLE_WEIGHTS} targetKg={78} />
        </RecordSection>

        <RecordSection
          flip
          tilt="lg:rotate-[0.6deg]"
          annotation={
            <Annotation
              index={6}
              title={r("diet.annotTitle")}
              text={r("diet.annotText")}
            />
          }
        >
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
        </RecordSection>

        <RecordSection
          tilt="lg:-rotate-[0.8deg]"
          annotation={
            <Annotation
              index={7}
              title={r("training.annotTitle")}
              text={r("training.annotText")}
            />
          }
        >
          <h2 className="mb-2 text-lg font-semibold">{r("training.title")}</h2>
          <p className="text-sm leading-relaxed">{r("training.content")}</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-success-soft px-4 py-2 text-sm font-medium text-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
            {r("training.done")}
          </p>
        </RecordSection>

        <RecordSection
          flip
          tilt="lg:rotate-1"
          annotation={
            <Annotation
              index={8}
              title={r("glp1.annotTitle")}
              text={r("glp1.annotText")}
            />
          }
        >
          <h2 className="mb-2 text-lg font-semibold">{r("glp1.title")}</h2>
          <p className="font-display text-xl font-semibold">{r("glp1.next")}</p>
          <p className="mt-1 text-sm text-ink-subtle">{r("glp1.drug")}</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-dashed border-primary px-4 py-1.5 text-sm">
            {r("glp1.site")}
          </p>
        </RecordSection>

        <RecordSection
          tilt="lg:-rotate-[0.6deg]"
          annotation={
            <Annotation
              index={9}
              title={r("comms.annotTitle")}
              text={r("comms.annotText")}
            />
          }
        >
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
        </RecordSection>

        <RecordSection
          flip
          tilt="lg:rotate-[0.7deg]"
          annotation={
            <Annotation
              index={10}
              title={r("privacy.annotTitle")}
              text={r("privacy.annotText")}
            />
          }
        >
          <h2 className="mb-3 text-lg font-semibold">{r("privacy.title")}</h2>
          <ul className="flex flex-col gap-2.5">
            {(["isolation", "blind", "rights", "eu"] as const).map((key) => (
              <li
                key={key}
                className="flex items-start gap-2.5 text-sm leading-relaxed"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0 text-success"><path d="M20 6 9 17l-5-5"/></svg>
                {r(`privacy.items.${key}`)}
              </li>
            ))}
          </ul>
        </RecordSection>
      </div>

      {/* Closing */}
      <div className="border-t border-hairline bg-surface-1 px-6 py-32">
        <Reveal className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("closing.title")}
          </h2>
          <p className="max-w-[48ch] text-balance leading-relaxed text-ink-subtle">
            {t("closing.text")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <CtaButton href="/auth/sign-up">{t("closing.cta")}</CtaButton>
            <Link
              href="/auth/sign-in"
              className="text-sm font-medium text-ink-subtle underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {t("closing.secondary")}
            </Link>
          </div>
        </Reveal>
      </div>

      <footer className="px-6 py-10 text-center text-xs text-ink-tertiary">
        &copy; {new Date().getFullYear()} Nutrionyx
      </footer>
    </main>
  );
}
