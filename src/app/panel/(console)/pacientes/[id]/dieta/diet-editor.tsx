"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { FOODS_BY_GROUP, findFood } from "@/modules/diet/foods";
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
  dayTotals,
} from "@/modules/diet/plan";
import { dietFormAction, type DietPlanFormState } from "./actions";
import { TemplateBar } from "@/components/template-bar";

/**
 * Structured week editor (slice-21). Rows live in React state because the
 * specialist adds and removes them; the form still posts plain named
 * fields so the server action stays a normal FormData reader.
 *
 * Field names encode their address:
 *   meal-{day}-{slot}-{group}-{row}-amount   group = "main" | "alt{n}"
 *   meal-{day}-{slot}-{group}-{row}-food
 *   meal-{day}-{slot}-{group}-{row}-foodKey   optional, catalogue key
 *   meal-{day}-{slot}-{group}-{row}-grams     optional, only with a key
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
  const tpl = useTranslations("diet.templates");
  const [state, formAction, isPending] = useActionState<
    DietPlanFormState,
    FormData
  >(dietFormAction, null);
  const [week, setWeek] = useState<WeekDraft>(() => toDraft(initial.content));
  const [dirty, setDirty] = useState(false);
  // Render-time adjustment (not an effect): a fresh ok state clears dirty.
  // `defaultValue` is only read when an input mounts, so echoing the
  // submitted values back is not enough on its own: the cells have to be
  // remounted for the echo to reach the DOM. Bumping a key on the form
  // does that once per action, which is also when focus would move anyway.
  const [generation, setGeneration] = useState(0);
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    setGeneration((n) => n + 1);
    if (state && "ok" in state && state.scope === "plan") setDirty(false);
  }
  // Loading a template rewrites the plan on the server and revalidates,
  // but the rows live in state, which a re-render leaves untouched: the
  // specialist would be told "plantilla cargada" over the old week.
  // Compare by value, since every server render rebuilds the object.
  const contentKey = JSON.stringify(initial.content);
  const [prevContent, setPrevContent] = useState(contentKey);
  if (contentKey !== prevContent) {
    setPrevContent(contentKey);
    setGeneration((n) => n + 1);
    setWeek(toDraft(initial.content));
    setDirty(false);
  }
  useUnsavedGuard(dirty, t("editor.unsaved"));

  // React 19 resets the form after every action, success included, and
  // these cells are uncontrolled. Re-hydrate from whatever the action
  // echoed back. Loading a template deliberately echoes nothing, so the
  // loaded week wins over what was on screen.
  const v = (name: string, fallback: string) =>
    state?.values ? (state.values[name] ?? fallback) : fallback;

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


  /**
   * Choosing from the catalogue fills the free-text name too, so the row
   * still reads as a sentence in the printed plan and in the patient's app.
   * Clearing the pick drops the grams with it: grams without a food count
   * nothing and would sit there looking meaningful.
   */
  const pickFood = (
    dayIndex: number,
    slot: MealSlot,
    group: string,
    rowIndex: number,
    key: string,
  ) => {
    const food = findFood(key);
    editMeal(dayIndex, slot, (meal) => {
      const apply = (rows: FoodRow[]) =>
        rows.map((row, i) =>
          i === rowIndex
            ? food
              ? { ...row, foodKey: food.key, food: food.name }
              : { amount: row.amount, food: row.food }
            : row,
        );
      if (group === "main") return { ...meal, main: apply(meal.main) };
      const altIndex = Number(group.slice(3));
      return {
        ...meal,
        alternatives: meal.alternatives.map((rows, i) =>
          i === altIndex ? apply(rows) : rows,
        ),
      };
    });
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
          <div key={rowIndex} className="flex flex-wrap items-center gap-1.5">
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
            {/* Optional, and that is the whole design: picking a catalogue
                food makes the row countable, leaving it alone keeps the plan
                writable in the words a specialist already uses. */}
            <div className="order-last flex w-full items-center gap-1.5">
              <div className="min-w-0 flex-1">
              <Select
                name={`${base}-foodKey`}
                value={row.foodKey ?? ""}
                onChange={(event) =>
                  pickFood(dayIndex, slot, group, rowIndex, event.target.value)
                }
                aria-label={t("editor.catalogueLabel")}
                className="h-9 py-1.5 text-sm"
              >
                <option value="">{t("editor.catalogueNone")}</option>
                {FOODS_BY_GROUP.map(({ group: foodGroup, foods }) => (
                  <optgroup key={foodGroup} label={t(`groups.${foodGroup}`)}>
                    {foods.map((food) => (
                      <option key={food.key} value={food.key}>
                        {food.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
              </div>
            <input
              name={`${base}-grams`}
              type="text"
              inputMode="numeric"
              maxLength={5}
              defaultValue={v(`${base}-grams`, row.grams ? String(row.grams) : "")}
              aria-label={t("editor.gramsLabel")}
              placeholder="g"
              disabled={!row.foodKey}
              className="w-16 shrink-0 rounded-[10px] border border-field-border bg-surface-2 px-2 py-1.5 text-sm tabular-nums text-ink disabled:opacity-40"
            />
            </div>
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
      key={generation}
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
        pending={isPending}
        message={
          state && state.scope === "template"
            ? "ok" in state
              ? { kind: "ok", text: tpl(state.kind === "loaded" ? "loadedOk" : "savedOk") }
              : { kind: "error", text: tpl(`errors.${state.errorKey}`) }
            : null
        }
      />

      <div className="flex flex-col gap-4">
        {week.map((day, dayIndex) => (
          <section
            key={dayIndex}
            className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-base font-semibold capitalize">
                {t(`days.${dayIndex}`)}
              </h2>
              {/* The count of rows outside the catalogue sits next to the
                  total, always. A sum that quietly ignores half a meal reads
                  as a complete day and is worse than no sum at all. */}
              <p className="text-xs text-ink-subtle">
                {(() => {
                  const totals = dayTotals(day);
                  const counted =
                    totals.kcal > 0
                      ? t("editor.totals.value", {
                          kcal: totals.kcal,
                          protein: totals.proteinG,
                        })
                      : t("editor.totals.none");
                  return totals.uncounted > 0
                    ? `${counted} · ${t("editor.totals.uncounted", { count: totals.uncounted })}`
                    : counted;
                })()}
              </p>
            </div>
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
        <Button type="submit" name="intent" value="save" disabled={isPending}>
          {isPending ? t("editor.saving") : t("editor.save")}
        </Button>
        <div role="status">
          {state && "ok" in state && state.scope === "plan" ? (
            <span className="rounded-full bg-success-soft px-3 py-1.5 text-sm text-success">
              {t("editor.saved")}
            </span>
          ) : null}
        </div>
        {state && "errorKey" in state && state.scope === "plan" ? (
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
