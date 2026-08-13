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
  summarizeRows,
} from "@/modules/diet/plan";
import { PrintFrame } from "../../print-frame";

export const metadata = { title: "Plan de dieta" };
export const dynamic = "force-dynamic";

/** The week as a document: one block per day, meals in order, alternatives
 *  under their meal. Days without food are skipped rather than printed
 *  empty, so a four-day plan is four blocks and not seven. */
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
      footer={plan?.notes ?? null}
    >
      {!content || isEmptyPlan(content) ? (
        <p className="text-sm text-ink-subtle">{tp("emptyDiet")}</p>
      ) : (
        <div className="flex flex-col gap-5">
          {content.days.map((day, dayIndex) => {
            const meals = MEAL_SLOTS.filter((slot) => day[slot]);
            if (meals.length === 0) return null;
            return (
              <section
                key={dayIndex}
                className="flex break-inside-avoid flex-col gap-2"
              >
                <h2 className="border-b border-hairline pb-1 font-display text-base font-semibold capitalize">
                  {t(`days.${dayIndex}`)}
                </h2>
                <dl className="flex flex-col gap-2">
                  {meals.map((slot) => {
                    const meal = day[slot]!;
                    return (
                      <div key={slot} className="flex flex-col gap-0.5">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                          {t(`slots.${slot}`)}
                        </dt>
                        <dd className="text-sm leading-relaxed">
                          {summarizeRows(meal.main)}
                        </dd>
                        {meal.alternatives.map((rows, i) => (
                          <dd
                            key={i}
                            className="text-sm leading-relaxed text-ink-subtle"
                          >
                            <span className="font-medium">
                              {t("editor.alternative", { n: i + 1 })}:
                            </span>{" "}
                            {summarizeRows(rows)}
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
