import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { getPatientDetail } from "@/modules/patient/repository";
import { getDietPlan } from "@/modules/diet/repository";
import { getOrgProfile } from "@/modules/organization/repository";
import {
  MEAL_SLOTS,
  dayTotals,
  isEmptyPlan,
  normalizeContent,
} from "@/modules/diet/plan";
import { PrintFrame } from "../../print-frame";

export const metadata = { title: "Plan de dieta" };
export const dynamic = "force-dynamic";

/**
 * The week as a grid: meals down the side, days across the top.
 *
 * Stacking days made a seven-day plan four pages, and a plan a patient has
 * to leaf through on a kitchen counter is a plan they stop reading. A week
 * is seven comparable things, so they are columns; the five meals are the
 * rows they are compared on. That is also how a printed meal plan has
 * always been laid out, which is a good sign rather than a boring one.
 *
 * Landscape, because seven columns want width. One page is the brief.
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

  // Only the days that carry food, so a four-day plan gets four wider
  // columns instead of three empty ones.
  const days = (content?.days ?? [])
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => MEAL_SLOTS.some((slot) => day[slot]));
  // Only the meals someone actually prescribes: no empty "merienda" row
  // across the whole week.
  const slots = MEAL_SLOTS.filter((slot) =>
    days.some(({ day }) => day[slot]),
  );

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
      fiscal={[
        profile?.legalName,
        profile?.taxId,
        profile?.addressLine,
        [profile?.postalCode, profile?.locality].filter(Boolean).join(" ") || null,
        profile?.hours,
      ].filter((part): part is string => Boolean(part && part.trim()))}
      footer={plan?.notes ?? null}
    >
      {!content || isEmptyPlan(content) ? (
        <p className="text-sm text-ink-subtle">{tp("emptyDiet")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-[8.5pt] leading-[1.25]">
            <thead>
              <tr>
                <th className="w-[7%] border border-hairline bg-surface-3 p-1" />
                {days.map(({ index }) => (
                  <th
                    key={index}
                    scope="col"
                    className="border border-hairline bg-surface-3 px-1.5 py-1 text-left font-display text-[9pt] font-semibold capitalize"
                  >
                    {t(`days.${index}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot} className="break-inside-avoid">
                  <th
                    scope="row"
                    className="border border-hairline bg-surface-2 px-1.5 py-1 text-left align-top text-[7.5pt] font-semibold uppercase leading-tight tracking-[0.04em] text-accent-text"
                  >
                    {t(`slots.${slot}`)}
                  </th>
                  {days.map(({ day, index }) => {
                    const meal = day[slot];
                    return (
                      <td
                        key={index}
                        className="border border-hairline px-1.5 py-1 align-top"
                      >
                        {meal ? (
                          <>
                            <ul className="flex flex-col">
                              {meal.main.map((row, i) => (
                                <li key={i}>
                                  <span className="font-semibold tabular-nums">
                                    {row.amount}
                                  </span>{" "}
                                  {row.food}
                                </li>
                              ))}
                            </ul>
                            {/* Alternatives stay in their cell, quieter and
                                behind a rule: the same meal, not another. */}
                            {meal.alternatives.map((rows, i) => (
                              <ul
                                key={i}
                                className="mt-1 border-t border-dashed border-hairline pt-1 text-ink-subtle"
                              >
                                {rows.map((row, j) => (
                                  <li key={j}>
                                    <span className="tabular-nums">
                                      {row.amount}
                                    </span>{" "}
                                    {row.food}
                                  </li>
                                ))}
                              </ul>
                            ))}
                          </>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Totals on the sheet the patient takes to the kitchen, which
                  is where they would look. Only when something counts, and
                  only for the days that count something. */}
              {days.some(({ day }) => dayTotals(day).kcal > 0) ? (
                <tr>
                  <th className="border border-hairline bg-surface-3 p-1 text-left align-top text-[7.5pt] font-semibold">
                    {tp("totals")}
                  </th>
                  {days.map(({ day, index }) => {
                    const totals = dayTotals(day);
                    return (
                      <td
                        key={index}
                        className="border border-hairline p-1 align-top text-[8pt] tabular-nums"
                      >
                        {totals.kcal > 0
                          ? tp("totalsValue", {
                              kcal: totals.kcal,
                              protein: totals.proteinG,
                            })
                          : ""}
                      </td>
                    );
                  })}
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </PrintFrame>
  );
}
