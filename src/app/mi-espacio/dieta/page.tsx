import { getTranslations, getFormatter } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { getDietPlan } from "@/modules/diet/repository";
import { getDayLog } from "@/modules/diet/meal-log";
import { MealMark } from "./meal-mark";
import { getTargets } from "@/modules/targets/repository";
import {
  MEAL_SLOTS,
  dayTotals,
  isEmptyPlan,
  normalizeContent,
} from "@/modules/diet/plan";
import { madridWeekdayIndex } from "@/modules/scheduling/time";

export const metadata = { title: "Mi dieta" };
export const dynamic = "force-dynamic";

export default async function PatientDietPage() {
  const t = await getTranslations("diet");
  const tt = await getTranslations("targets.today");
  const format = await getFormatter();

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    redirect("/");
  }

  const plan = await getDietPlan(patient.organizationId, patient.id);
  const content = plan ? normalizeContent(plan.content) : null;
  const hasPlan = plan != null && content != null && !isEmptyPlan(content);

  const targets = await getTargets(patient.organizationId, patient.id);
  // Only today's marks are read: the controls only render on today.
  const todayLog = await getDayLog(
    patient.organizationId,
    patient.id,
    new Date(),
  );
  const planParts = targets
    ? [
        targets.kcalTarget != null
          ? tt("plan.kcal", { kcal: targets.kcalTarget })
          : null,
        targets.proteinTargetG != null
          ? tt("plan.protein", { grams: targets.proteinTargetG })
          : null,
      ].filter(Boolean)
    : [];

  // Monday-first index for "today" (Madrid calendar day).
  const todayIndex = madridWeekdayIndex();

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">
            {plan?.title || t("patient.heading")}
          </h1>
          {plan ? (
            <p className="text-sm text-ink-subtle">
              {t("patient.updatedAt", {
                date: format.dateTime(plan.updatedAt, { dateStyle: "long" }),
              })}
              {planParts.length > 0 ? ` · ${planParts.join(" · ")}` : ""}
            </p>
          ) : null}
        </div>

        {plan?.notes ? (
          <p className="rounded-xl border border-hairline bg-surface-1 p-4 text-sm leading-relaxed">
            {plan.notes}
          </p>
        ) : null}

        {hasPlan ? (
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {content.days.map((day, dayIndex) => {
              const meals = MEAL_SLOTS.filter((slot) => day[slot]);
              if (meals.length === 0) return null;
              const isToday = dayIndex === todayIndex;
              return (
                <section
                  key={dayIndex}
                  className={`flex flex-col gap-3 rounded-xl border p-5 ${
                    isToday
                      ? "border-primary bg-surface-1 shadow-el-sm md:col-span-2 xl:col-span-3"
                      : "border-hairline bg-surface-1"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold capitalize">
                      {t(`days.${dayIndex}`)}
                    </h2>
                    {isToday ? (
                      <span className="rounded-full bg-surface-3 px-2 py-0.5 text-xs font-medium">
                        {t("patient.today")}
                      </span>
                    ) : null}
                    {/* Only when something counts. A patient does not need to
                        be told their plan was written in words. */}
                    {(() => {
                      const totals = dayTotals(day);
                      if (totals.kcal === 0) return null;
                      return (
                        <span className="ml-auto text-xs tabular-nums text-ink-subtle">
                          {t("patient.dayTotals", {
                            kcal: totals.kcal,
                            protein: totals.proteinG,
                            carbs: totals.carbsG,
                            fat: totals.fatG,
                          })}
                          {/* Without this a patient reads 330 kcal on a day
                              that also has ten foods nobody weighed. */}
                          {totals.uncounted > 0
                            ? ` · ${t("patient.uncounted", { count: totals.uncounted })}`
                            : ""}
                        </span>
                      );
                    })()}
                  </div>
                  <dl className="flex flex-col gap-3">
                    {meals.map((slot) => {
                      const meal = day[slot]!;
                      return (
                        <div key={slot} className="flex flex-col gap-1">
                          <dt className="text-xs font-medium text-ink-subtle">
                            {t(`slots.${slot}`)}
                          </dt>
                          <dd className="flex flex-col gap-1.5 text-sm leading-relaxed">
                            {isToday ? (
                              <MealMark slot={slot} current={todayLog[slot]} />
                            ) : null}
                            <ul className="flex flex-col gap-0.5">
                              {meal.main.map((row, i) => (
                                <li key={i} className="flex gap-2">
                                  {row.amount ? (
                                    <span className="shrink-0 tabular-nums text-ink-subtle">
                                      {row.amount}
                                    </span>
                                  ) : null}
                                  <span>{row.food}</span>
                                </li>
                              ))}
                            </ul>
                            {meal.alternatives.map((rows, altIndex) => (
                              <div
                                key={altIndex}
                                className="flex flex-col gap-0.5 border-l border-hairline pl-2.5"
                              >
                                <p className="text-xs font-medium text-ink-subtle">
                                  {t("patient.alternative", {
                                    n: altIndex + 1,
                                  })}
                                </p>
                                <ul className="flex flex-col gap-0.5">
                                  {rows.map((row, i) => (
                                    <li key={i} className="flex gap-2">
                                      {row.amount ? (
                                        <span className="shrink-0 tabular-nums text-ink-subtle">
                                          {row.amount}
                                        </span>
                                      ) : null}
                                      <span>{row.food}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </section>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-hairline bg-surface-1 p-6 text-sm text-ink-subtle">
            {t("patient.empty")}
          </p>
        )}
      </div>
    </>
  );
}
