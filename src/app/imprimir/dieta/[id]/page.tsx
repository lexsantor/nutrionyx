import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { getPatientDetail } from "@/modules/patient/repository";
import { getDietPlan } from "@/modules/diet/repository";
import { getOrgProfile } from "@/modules/organization/repository";
import {
  MEAL_SLOTS,
  isEmptyPlan,
  normalizeContent,
} from "@/modules/diet/plan";
import { PrintFrame } from "../../print-frame";

export const metadata = { title: "Plan de dieta" };
export const dynamic = "force-dynamic";

/**
 * The week as a document. Days are cards in two columns rather than one
 * long list: a week is seven comparable things, and a column of paragraphs
 * makes the reader count to find Thursday.
 *
 * Days with no food are skipped, so a four-day plan is four cards and not
 * seven with three saying nothing.
 */
export default async function DietPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("diet");
  const tp = await getTranslations("print");
  const format = await getFormatter();
  const { org } = await requireSpecialistOrg();

  const patient = await getPatientDetail(org.id, id);
  if (!patient) notFound();

  const [plan, profile] = await Promise.all([
    getDietPlan(org.id, patient.id),
    getOrgProfile(org.id),
  ]);
  const content = plan ? normalizeContent(plan.content) : null;

  return (
    <PrintFrame
      consulta={profile?.name ?? org.name}
      logoUrl={profile?.logoUrl ?? null}
      kind={t("editor.heading")}
      patientName={patient.fullName ?? patient.email}
      title={plan?.title || t("editor.heading")}
      subtitle={
        plan
          ? tp("updatedAt", {
              date: format.dateTime(plan.updatedAt, { dateStyle: "long" }),
            })
          : null
      }
      printLabel={tp("print")}
      backHref={`/panel/pacientes/${patient.id}/dieta`}
      backLabel={tp("back")}
      notesLabel={tp("notes")}
      footer={plan?.notes ?? null}
    >
      {!content || isEmptyPlan(content) ? (
        <p className="text-sm text-ink-subtle">{tp("emptyDiet")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {content.days.map((day, dayIndex) => {
            const meals = MEAL_SLOTS.filter((slot) => day[slot]);
            if (meals.length === 0) return null;
            return (
              <section
                key={dayIndex}
                className="flex break-inside-avoid flex-col overflow-hidden rounded-[10px] border border-hairline"
              >
                <h2 className="bg-surface-3 px-3 py-1.5 font-display text-sm font-semibold capitalize tracking-tight">
                  {t(`days.${dayIndex}`)}
                </h2>
                <dl className="flex flex-col gap-2 px-3 py-2.5">
                  {meals.map((slot) => {
                    const meal = day[slot]!;
                    return (
                      <div key={slot} className="flex flex-col gap-0.5">
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-accent-text">
                          {t(`slots.${slot}`)}
                        </dt>
                        <dd className="text-[13px] leading-snug">
                          <ul className="flex flex-col">
                            {meal.main.map((row, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="w-14 shrink-0 tabular-nums text-ink-subtle">
                                  {row.amount}
                                </span>
                                <span className="min-w-0">{row.food}</span>
                              </li>
                            ))}
                          </ul>
                        </dd>
                        {/* Alternatives sit under their meal, set back and
                            quieter: they are the same meal, not another. */}
                        {meal.alternatives.map((rows, i) => (
                          <dd
                            key={i}
                            className="ml-1 border-l-2 border-hairline pl-2 text-[12px] leading-snug text-ink-subtle"
                          >
                            <span className="font-semibold">
                              {t("editor.alternative", { n: i + 1 })}
                            </span>
                            <ul className="flex flex-col">
                              {rows.map((row, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="w-12 shrink-0 tabular-nums">
                                    {row.amount}
                                  </span>
                                  <span className="min-w-0">{row.food}</span>
                                </li>
                              ))}
                            </ul>
                          </dd>
                        ))}
                      </div>
                    );
                  })}
                </dl>
              </section>
            );
          })}
        </div>
      )}
    </PrintFrame>
  );
}
