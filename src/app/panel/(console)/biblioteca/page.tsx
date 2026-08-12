import { getFormatter, getTranslations } from "next-intl/server";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { listDietTemplates } from "@/modules/diet/templates";
import { listTrainingTemplates } from "@/modules/training/templates";
import {
  summarizeDietWeek,
  summarizeRoutineWeek,
  type WeekSummary,
} from "@/modules/templates/summary";
import {
  MEAL_SLOTS,
  normalizeContent,
  summarizeRows,
  type DietPlanContent,
} from "@/modules/diet/plan";
import {
  formatPrescription,
  normalizeRoutine,
  type RoutineContent,
} from "@/modules/training/routine";
import { TemplateActions } from "./template-actions";
import type { TemplateKind } from "./actions";

export const dynamic = "force-dynamic";

/**
 * The consulta's reusable weeks (docs/build/navigation-audit.md, tier 1).
 * Until this page existed, templates could only be reached by opening an
 * arbitrary patient's diet or training editor, which made an org-level
 * asset effectively write-only.
 *
 * Preview is a native <details>: the whole page ships no JavaScript except
 * the per-row actions.
 */

type Row = {
  id: string;
  name: string;
  updatedAt: Date;
  content: unknown;
  summary: WeekSummary;
};

/** Compact week preview. Reuses the editors' own formatting helpers. */
async function DietPreview({ content }: { content: unknown }) {
  const t = await getTranslations("diet");
  const plan = normalizeContent(content) as DietPlanContent | null;
  if (!plan) return null;

  return (
    <ul className="flex flex-col gap-3">
      {plan.days.map((day, index) => {
        const meals = MEAL_SLOTS.filter((slot) => day[slot]);
        if (meals.length === 0) return null;
        return (
          <li key={index} className="flex flex-col gap-1">
            <span className="text-xs font-semibold capitalize text-ink-subtle">
              {t(`days.${index}`)}
            </span>
            {meals.map((slot) => (
              <span key={slot} className="flex gap-2 text-sm">
                <span className="w-24 shrink-0 text-ink-subtle">
                  {t(`slots.${slot}`)}
                </span>
                <span className="min-w-0">{summarizeRows(day[slot]!.main)}</span>
              </span>
            ))}
          </li>
        );
      })}
    </ul>
  );
}

async function RoutinePreview({ content }: { content: unknown }) {
  const t = await getTranslations("training");
  const routine = normalizeRoutine(content) as RoutineContent | null;
  if (!routine) return null;

  return (
    <ul className="flex flex-col gap-3">
      {routine.days.map((day, index) => {
        if (day.exercises.length === 0) return null;
        return (
          <li key={index} className="flex flex-col gap-1">
            <span className="text-xs font-semibold capitalize text-ink-subtle">
              {t(`days.${index}`)}
            </span>
            {day.exercises.map((exercise, i) => (
              <span key={i} className="flex gap-2 text-sm">
                <span className="w-16 shrink-0 tabular-nums text-ink-subtle">
                  {formatPrescription(exercise)}
                </span>
                <span className="min-w-0">{exercise.name}</span>
              </span>
            ))}
          </li>
        );
      })}
    </ul>
  );
}

async function TemplateSection({
  kind,
  rows,
}: {
  kind: TemplateKind;
  rows: Row[];
}) {
  const t = await getTranslations("library");
  const format = await getFormatter();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t(`${kind}.title`)}</h2>
        <p className="text-sm text-ink-subtle">{t(`${kind}.hint`)}</p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-hairline bg-surface-1 p-6 text-sm text-ink-subtle">
          {t(`${kind}.empty`)}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-5"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-base font-semibold">{row.name}</h3>
                <span className="text-xs text-ink-subtle">
                  {row.summary.broken
                    ? t("unreadable")
                    : t("summary", {
                        days: row.summary.days,
                        items: row.summary.items,
                      })}
                </span>
                <span className="text-xs text-ink-subtle">
                  {t("updatedAt", {
                    date: format.dateTime(row.updatedAt, {
                      dateStyle: "medium",
                    }),
                  })}
                </span>
              </div>

              <TemplateActions kind={kind} id={row.id} name={row.name} />

              {row.summary.broken ? null : (
                <details className="group">
                  <summary className="w-fit cursor-pointer list-none rounded-full px-2 py-1 text-xs font-medium text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink">
                    <span className="group-open:hidden">{t("preview")}</span>
                    <span className="hidden group-open:inline">
                      {t("hidePreview")}
                    </span>
                  </summary>
                  <div className="mt-3 border-t border-hairline pt-3">
                    {kind === "diet" ? (
                      <DietPreview content={row.content} />
                    ) : (
                      <RoutinePreview content={row.content} />
                    )}
                  </div>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function LibraryPage() {
  const t = await getTranslations("library");
  const { org } = await requireSpecialistOrg();

  const [diet, training] = await Promise.all([
    listDietTemplates(org.id),
    listTrainingTemplates(org.id),
  ]);

  const dietRows: Row[] = diet.map((template) => ({
    id: template.id,
    name: template.name,
    updatedAt: template.updatedAt,
    content: template.content,
    summary: summarizeDietWeek(template.content),
  }));
  const trainingRows: Row[] = training.map((template) => ({
    id: template.id,
    name: template.name,
    updatedAt: template.updatedAt,
    content: template.content,
    summary: summarizeRoutineWeek(template.content),
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-base text-ink-subtle">{t("subtitle")}</p>
      </div>

      <TemplateSection kind="diet" rows={dietRows} />
      <TemplateSection kind="training" rows={trainingRows} />
    </div>
  );
}
