"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";
import { Input } from "@/components/ui/input";
import {
  ALTERNATIVES_PER_MEAL_MAX,
  AMOUNT_MAX,
  FOOD_MAX,
  MEAL_SLOTS,
  ROWS_PER_GROUP_MAX,
  type DietPlanContent,
  type FoodRow,
  type MealSlot,
} from "@/modules/diet/plan";
import {
  loadDietTemplateAction,
  saveDietPlanAction,
  saveDietTemplateAction,
  type DietPlanFormState,
} from "./actions";
import { TemplateBar } from "@/components/template-bar";

/**
 * Structured week editor (slice-21). Rows live in React state because the
 * specialist adds and removes them; the form still posts plain named
 * fields so the server action stays a normal FormData reader.
 *
 * Field names encode their address:
 *   meal-{day}-{slot}-{group}-{row}-amount   group = "main" | "alt{n}"
 *   meal-{day}-{slot}-{group}-{row}-food
 */

type MealDraft = { main: FoodRow[]; alternatives: FoodRow[][] };
type WeekDraft = Partial<Record<MealSlot, MealDraft>>[];

const blankRow = (): FoodRow => ({ amount: "", food: "" });

function toDraft(content: DietPlanContent): WeekDraft {
  return content.days.map((day) => {
    const out: Partial<Record<MealSlot, MealDraft>> = {};
    for (const slot of MEAL_SLOTS) {
      const meal = day[slot];
      out[slot] = meal
        ? {
            main: meal.main.length > 0 ? [...meal.main] : [blankRow()],
            alternatives: meal.alternatives.map((rows) => [...rows]),
          }
        : { main: [blankRow()], alternatives: [] };
    }
    return out;
  });
}

export function DietEditor({
  patientId,
  initial,
  templates,
}: {
  patientId: string;
  initial: {
    title: string | null;
    notes: string | null;
    content: DietPlanContent;
  };
  templates: { id: string; name: string }[];
}) {
  const t = useTranslations("diet");
  const [state, formAction, isPending] = useActionState<
    DietPlanFormState,
    FormData
  >(saveDietPlanAction, null);
  const [week, setWeek] = useState<WeekDraft>(() => toDraft(initial.content));
  const [dirty, setDirty] = useState(false);
  // Render-time adjustment (not an effect): a fresh ok state clears dirty.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state && "ok" in state) setDirty(false);
  }
  // Loading a template rewrites the plan on the server and revalidates,
  // but the rows live in state, which a re-render leaves untouched: the
  // specialist would be told "plantilla cargada" over the old week.
  // Compare by value, since every server render rebuilds the object.
  const contentKey = JSON.stringify(initial.content);
  const [prevContent, setPrevContent] = useState(contentKey);
  if (contentKey !== prevContent) {
    setPrevContent(contentKey);
    setWeek(toDraft(initial.content));
    setDirty(false);
  }
  useUnsavedGuard(dirty, t("editor.unsaved"));

  // After an error the browser form has been reset (React 19): fall back
  // to the echoed submitted values so nothing the user typed is lost.
  const v = (name: string, fallback: string) =>
    state && "errorKey" in state && state.values
      ? (state.values[name] ?? fallback)
      : fallback;

  const editMeal = (
    dayIndex: number,
    slot: MealSlot,
    edit: (meal: MealDraft) => MealDraft,
  ) => {
    setDirty(true);
    setWeek((current) =>
      current.map((day, i) => {
        if (i !== dayIndex) return day;
        const meal = day[slot] ?? { main: [blankRow()], alternatives: [] };
        return { ...day, [slot]: edit(meal) };
      }),
    );
  };


  const addFoodButton = (
    disabled: boolean,
    onClick: () => void,
    label: string,
  ) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="self-start rounded-full border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-ink transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150 disabled:opacity-50"
    >
      {t("editor.addFood")}
    </button>
  );

  const rowFields = (
    dayIndex: number,
    slot: MealSlot,
    group: string,
    rows: FoodRow[],
    onRemove: ((rowIndex: number) => void) | null,
  ) => (
    <div className="flex flex-col gap-1.5">
      {rows.map((row, rowIndex) => {
        const base = `meal-${dayIndex}-${slot}-${group}-${rowIndex}`;
        return (
          <div key={rowIndex} className="flex items-center gap-1.5">
            <input
              name={`${base}-amount`}
              type="text"
              maxLength={AMOUNT_MAX}
              defaultValue={v(`${base}-amount`, row.amount)}
              aria-label={t("editor.amountLabel")}
              className="w-20 shrink-0 rounded-[10px] border border-field-border bg-surface-2 px-2 py-1.5 text-sm tabular-nums text-ink"
            />
            <input
              name={`${base}-food`}
              type="text"
              maxLength={FOOD_MAX}
              defaultValue={v(`${base}-food`, row.food)}
              aria-label={t("editor.foodLabel")}
              className="min-w-0 flex-1 rounded-[10px] border border-field-border bg-surface-2 px-2 py-1.5 text-sm text-ink"
            />
            {onRemove && rows.length > 1 ? (
              <button
                type="button"
                onClick={() => onRemove(rowIndex)}
                aria-label={t("editor.removeRow")}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-3 hover:text-error"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <form
      action={formAction}
      onInput={() => setDirty(true)}
      className="flex flex-col gap-6"
    >
      <input type="hidden" name="patientId" value={patientId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium">
            {t("editor.titleLabel")}
          </label>
          <Input
            id="title"
            name="title"
            type="text"
            maxLength={120}
            defaultValue={v("title", initial.title ?? "")}
            placeholder={t("editor.titlePlaceholder")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium">
            {t("editor.notesLabel")}
          </label>
          <textarea
            id="notes"
            name="notes"
            maxLength={2000}
            rows={2}
            defaultValue={v("notes", initial.notes ?? "")}
            placeholder={t("editor.notesPlaceholder")}
            className="block w-full resize-y rounded-[10px] border border-field-border bg-surface-2 px-3.5 py-2.5 text-base text-ink placeholder:text-ink-subtle"
          />
        </div>
      </div>

      <TemplateBar
        namespace="diet.templates"
        templates={templates}
        saveAction={saveDietTemplateAction}
        loadAction={loadDietTemplateAction}
      />

      <div className="flex flex-col gap-4">
        {week.map((day, dayIndex) => (
          <section
            key={dayIndex}
            className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-5"
          >
            <h2 className="text-base font-semibold capitalize">
              {t(`days.${dayIndex}`)}
            </h2>
            <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
              {MEAL_SLOTS.map((slot) => {
                const meal = day[slot] ?? {
                  main: [blankRow()],
                  alternatives: [],
                };
                return (
                  <fieldset
                    key={slot}
                    className="flex flex-col gap-2 rounded-[10px] border border-hairline p-3"
                  >
                    <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      {t(`slots.${slot}`)}
                    </legend>

                    <div className="flex gap-1.5 px-0.5 text-[11px] font-medium text-ink-subtle">
                      <span className="w-20 shrink-0">
                        {t("editor.amountLabel")}
                      </span>
                      <span>{t("editor.foodLabel")}</span>
                    </div>

                    {rowFields(dayIndex, slot, "main", meal.main, (rowIndex) =>
                      editMeal(dayIndex, slot, (m) => ({
                        ...m,
                        main: m.main.filter((_, i) => i !== rowIndex),
                      })),
                    )}
                    {addFoodButton(
                      meal.main.length >= ROWS_PER_GROUP_MAX,
                      () =>
                        editMeal(dayIndex, slot, (m) => ({
                          ...m,
                          main: [...m.main, blankRow()],
                        })),
                      t("editor.addFoodToMain"),
                    )}

                    {meal.alternatives.map((rows, altIndex) => (
                      <div key={altIndex} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                            {t("editor.alternative", { n: altIndex + 1 })}
                          </span>
                          <span className="h-px flex-1 bg-hairline" />
                          <button
                            type="button"
                            onClick={() =>
                              editMeal(dayIndex, slot, (m) => ({
                                ...m,
                                alternatives: m.alternatives.filter(
                                  (_, i) => i !== altIndex,
                                ),
                              }))
                            }
                            aria-label={t("editor.removeAlternative", {
                              n: altIndex + 1,
                            })}
                            className="flex size-6 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-3 hover:text-error"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                        {rowFields(
                          dayIndex,
                          slot,
                          `alt${altIndex}`,
                          rows,
                          (rowIndex) =>
                            editMeal(dayIndex, slot, (m) => ({
                              ...m,
                              alternatives: m.alternatives.map((group, i) =>
                                i === altIndex
                                  ? group.filter((_, r) => r !== rowIndex)
                                  : group,
                              ),
                            })),
                        )}
                        {addFoodButton(
                          rows.length >= ROWS_PER_GROUP_MAX,
                          () =>
                            editMeal(dayIndex, slot, (m) => ({
                              ...m,
                              alternatives: m.alternatives.map((group, i) =>
                                i === altIndex ? [...group, blankRow()] : group,
                              ),
                            })),
                          t("editor.addFoodToAlternative", { n: altIndex + 1 }),
                        )}
                      </div>
                    ))}

                    <div className="mt-1 flex flex-col gap-1.5">
                      <button
                        type="button"
                        disabled={
                          meal.alternatives.length >= ALTERNATIVES_PER_MEAL_MAX
                        }
                        onClick={() =>
                          editMeal(dayIndex, slot, (m) => ({
                            ...m,
                            alternatives: [...m.alternatives, [blankRow()]],
                          }))
                        }
                        className="rounded-full border border-hairline bg-surface-1 px-3 py-1.5 text-xs font-medium text-ink transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150 disabled:opacity-50"
                      >
                        {t("editor.addAlternative")}
                      </button>
                    </div>
                  </fieldset>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Same dock as the routine editor: spans the content column and
          carries its own surface. The console wrapper is px-6. */}
      <div className="sticky bottom-0 z-10 -mx-6 flex flex-wrap items-center gap-3 border-t border-hairline bg-surface-1 px-6 py-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? t("editor.saving") : t("editor.save")}
        </Button>
        <div role="status">
          {state && "ok" in state ? (
            <span className="rounded-full bg-success-soft px-3 py-1.5 text-sm text-success">
              {t("editor.saved")}
            </span>
          ) : null}
        </div>
        {state && "errorKey" in state ? (
          <span
            role="alert"
            className="rounded-full bg-error-soft px-3 py-1.5 text-sm text-error"
          >
            {t(`editor.errors.${state.errorKey}`)}
          </span>
        ) : null}
      </div>
    </form>
  );
}
