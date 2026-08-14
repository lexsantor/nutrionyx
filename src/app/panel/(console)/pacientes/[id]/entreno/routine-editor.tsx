"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";
import { Input } from "@/components/ui/input";
import {
  EXERCISES_PER_DAY_MAX,
  LOAD_MAX,
  NOTES_MAX,
  REPS_MAX,
  SETS_MAX,
  blankExercise,
  type Exercise,
  type RoutineContent,
} from "@/modules/training/routine";
import {
  exerciseImage,
  exercisesByGroup,
  findExercise,
} from "@/modules/training/exercises";
import { ExerciseThumb } from "@/components/exercise-thumb";
import { Select } from "@/components/ui/select";
import { routineFormAction, type RoutineFormState } from "./actions";
import { TemplateBar } from "@/components/template-bar";

/**
 * Structured week editor (slice-21C), mirroring the diet editor: rows in
 * React state, plain named fields on the wire.
 *
 *   ex-{day}-{row}-{key|name|sets|reps|notes}
 *
 * The exercise is picked from the catalogue, never typed: `key` carries
 * the choice and `name` rides along as a hidden field so a row keeps its
 * label even if the catalogue entry is later withdrawn. Only series and
 * repetitions are free text. A day with no exercises is a rest day, which
 * is why every day opens with an empty list rather than a blank row.
 */

const GROUPED = exercisesByGroup();

type WeekDraft = Exercise[][];

function toDraft(content: RoutineContent): WeekDraft {
  return content.days.map((day) => day.exercises.map((e) => ({ ...e })));
}

export function RoutineEditor({
  patientId,
  initial,
  templates,
}: {
  patientId: string;
  initial: {
    title: string | null;
    notes: string | null;
    content: RoutineContent;
  };
  templates: { id: string; name: string }[];
}) {
  const t = useTranslations("training");
  const tpl = useTranslations("training.templates");
  const [state, formAction, isPending] = useActionState<
    RoutineFormState,
    FormData
  >(routineFormAction, null);
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
    if (state && "ok" in state && state.scope === "routine") setDirty(false);
  }
  // Loading a template rewrites the routine on the server and revalidates,
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

  const editDay = (
    dayIndex: number,
    edit: (exercises: Exercise[]) => Exercise[],
  ) => {
    setDirty(true);
    setWeek((current) =>
      current.map((day, i) => (i === dayIndex ? edit(day) : day)),
    );
  };

  /**
   * The picker is controlled, unlike the free-text cells: the choice must
   * survive React 19's post-action form reset, and state does that on its
   * own without the `v()` echo.
   */
  const pickExercise = (dayIndex: number, rowIndex: number, key: string) =>
    editDay(dayIndex, (list) =>
      list.map((exercise, i) => {
        if (i !== rowIndex) return exercise;
        const picked = findExercise(key);
        if (picked) return { ...exercise, key: picked.key, name: picked.name };
        // Back to the placeholder: a catalogue row loses its derived
        // name, a legacy row keeps the text its specialist typed.
        return exercise.key
          ? { ...exercise, key: undefined, name: "" }
          : exercise;
      }),
    );

  const cell =
    "rounded-[10px] border border-field-border bg-surface-2 px-2 py-1.5 text-sm text-ink";

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
        namespace="training.templates"
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
        {week.map((exercises, dayIndex) => (
          <section
            key={dayIndex}
            className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-5"
          >
            <div className="flex items-baseline gap-3">
              <h2 className="text-base font-semibold capitalize">
                {t(`days.${dayIndex}`)}
              </h2>
              {exercises.length === 0 ? (
                <span className="text-xs text-ink-subtle">
                  {t("editor.restDay")}
                </span>
              ) : null}
            </div>

            {exercises.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-1.5 px-0.5 text-[11px] font-medium text-ink-subtle">
                  <span className="w-14 shrink-0">{t("editor.setsLabel")}</span>
                  <span className="w-20 shrink-0">{t("editor.repsLabel")}</span>
                  <span className="w-20 shrink-0 sm:w-28">{t("editor.loadLabel")}</span>
                  <span className="hidden sm:inline">{t("editor.exerciseLabel")}</span>
                </div>
                {exercises.map((exercise, rowIndex) => {
                  const base = `ex-${dayIndex}-${rowIndex}`;
                  return (
                    <div key={rowIndex} className="flex flex-wrap items-start gap-2">
                      <input
                        name={`${base}-sets`}
                        type="text"
                        maxLength={SETS_MAX}
                        defaultValue={v(`${base}-sets`, exercise.sets)}
                        aria-label={t("editor.setsLabel")}
                        className={`w-14 shrink-0 tabular-nums ${cell}`}
                      />
                      <input
                        name={`${base}-reps`}
                        type="text"
                        maxLength={REPS_MAX}
                        defaultValue={v(`${base}-reps`, exercise.reps)}
                        aria-label={t("editor.repsLabel")}
                        className={`w-20 shrink-0 tabular-nums ${cell}`}
                      />
                      {/* Without a load, "sentadilla 4 × 8" is not a
                          prescription. Free text like its neighbours: "70 kg",
                          "RPE 8", "peso corporal". */}
                      <input
                        name={`${base}-load`}
                        type="text"
                        maxLength={LOAD_MAX}
                        defaultValue={v(`${base}-load`, exercise.load ?? "")}
                        aria-label={t("editor.loadLabel")}
                        placeholder={t("editor.loadPlaceholder")}
                        // Wider than sets and reps, and wider still from sm
                        // up: a load is "72,5 kg" but also "peso corporal",
                        // which scrolled out of sight in a sets-sized box.
                        //
                        // Measured: from sm up nothing overflows. On a phone
                        // the longest values still scroll ~28px inside the
                        // field, because fitting them inline would need a
                        // 302px row and there are 292. Accepted rather than
                        // giving the load a line of its own on every row: a
                        // routine is written at a desk, and the common values
                        // ("72,5 kg", "RPE 8") fit at both sizes.
                        className={`w-20 shrink-0 tabular-nums sm:w-28 ${cell}`}
                      />
                      {/* On a phone the row wraps and the exercise column
                          takes a line of its own, so the remove control
                          rides with sets and reps; from sm up the orders
                          below put it back between the column and the
                          illustration. Alone on a line it read as a stray. */}
                      <button
                        type="button"
                        onClick={() =>
                          editDay(dayIndex, (list) =>
                            list.filter((_, i) => i !== rowIndex),
                          )
                        }
                        aria-label={t("editor.removeExercise")}
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-3 hover:text-error sm:order-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>
                      </button>
                      <div className="flex w-full min-w-0 flex-col gap-1 sm:order-1 sm:w-auto sm:max-w-80 sm:flex-1">
                        <Select
                          name={`${base}-key`}
                          value={exercise.key ?? ""}
                          onChange={(event) =>
                            pickExercise(dayIndex, rowIndex, event.target.value)
                          }
                          aria-label={t("editor.exerciseLabel")}
                          className="h-9 py-1.5 text-sm"
                        >
                          <option value="">
                            {exercise.key || !exercise.name
                              ? t("editor.chooseExercise")
                              : t("editor.customExercise", {
                                  name: exercise.name,
                                })}
                          </option>
                          {GROUPED.map(({ group, exercises: options }) => (
                            <optgroup key={group} label={t(`groups.${group}`)}>
                              {options.map((option) => (
                                <option key={option.key} value={option.key}>
                                  {/* An <option> renders text only, so the
                                      "has an illustration" cue has to be a
                                      word, not an icon. */}
                                  {exerciseImage(option.key)
                                    ? t("editor.withImage", {
                                        name: option.name,
                                      })
                                    : option.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </Select>
                        {/* Keeps the row's label if its catalogue entry is
                            ever withdrawn, and carries legacy free text. */}
                        <input
                          type="hidden"
                          name={`${base}-name`}
                          value={exercise.name}
                        />
                        <input
                          name={`${base}-notes`}
                          type="text"
                          maxLength={NOTES_MAX}
                          defaultValue={v(`${base}-notes`, exercise.notes ?? "")}
                          aria-label={t("editor.exerciseNotesLabel")}
                          placeholder={t("editor.exerciseNotesPlaceholder")}
                          className={`w-full ${cell} text-xs placeholder:text-ink-subtle`}
                        />
                      </div>
                      <ExerciseThumb
                        exerciseKey={exercise.key}
                        className="size-28 sm:order-3"
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}

            <button
              type="button"
              disabled={exercises.length >= EXERCISES_PER_DAY_MAX}
              onClick={() =>
                editDay(dayIndex, (list) => [...list, blankExercise()])
              }
              className="self-start rounded-full border border-hairline bg-surface-1 px-3 py-1 text-xs font-medium text-ink transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150 disabled:opacity-50"
            >
              {t("editor.addExercise")}
            </button>
          </section>
        ))}
      </div>

      {/* A real bar, not a floating pill: it spans the content column and
          carries its own surface, so scrolling under it reads as a dock
          rather than as a button that escaped its card. The console's
          content wrapper is px-6, which -mx-6 cancels. */}
      <div className="sticky bottom-0 z-10 -mx-6 flex flex-wrap items-center gap-3 border-t border-hairline bg-surface-1 px-6 py-4">
        <Button type="submit" name="intent" value="save" disabled={isPending}>
          {isPending ? t("editor.saving") : t("editor.save")}
        </Button>
        <div role="status">
          {state && "ok" in state && state.scope === "routine" ? (
            <span className="rounded-full bg-success-soft px-3 py-1.5 text-sm text-success">
              {t("editor.saved")}
            </span>
          ) : null}
        </div>
        {state && "errorKey" in state && state.scope === "routine" ? (
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
