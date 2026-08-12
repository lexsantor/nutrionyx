"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";
import { Input } from "@/components/ui/input";
import {
  EXERCISES_PER_DAY_MAX,
  EXERCISE_NAME_MAX,
  NOTES_MAX,
  REPS_MAX,
  SETS_MAX,
  blankExercise,
  type Exercise,
  type RoutineContent,
} from "@/modules/training/routine";
import {
  loadTrainingTemplateAction,
  saveRoutineAction,
  saveTrainingTemplateAction,
  type RoutineFormState,
} from "./actions";
import { TemplateBar } from "@/components/template-bar";

/**
 * Structured week editor (slice-21C), mirroring the diet editor: rows in
 * React state, plain named fields on the wire.
 *
 *   ex-{day}-{row}-{name|sets|reps|notes}
 *
 * A day with no exercises is a rest day, which is why every day opens
 * with an empty list rather than a blank row.
 */

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
  const [state, formAction, isPending] = useActionState<
    RoutineFormState,
    FormData
  >(saveRoutineAction, null);
  const [week, setWeek] = useState<WeekDraft>(() => toDraft(initial.content));
  const [dirty, setDirty] = useState(false);
  // Render-time adjustment (not an effect): a fresh ok state clears dirty.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state && "ok" in state) setDirty(false);
  }
  useUnsavedGuard(dirty, t("editor.unsaved"));

  // After an error the browser form has been reset (React 19): fall back
  // to the echoed submitted values so nothing the user typed is lost.
  const v = (name: string, fallback: string) =>
    state && "errorKey" in state && state.values
      ? (state.values[name] ?? fallback)
      : fallback;

  const editDay = (
    dayIndex: number,
    edit: (exercises: Exercise[]) => Exercise[],
  ) => {
    setDirty(true);
    setWeek((current) =>
      current.map((day, i) => (i === dayIndex ? edit(day) : day)),
    );
  };

  const cell =
    "rounded-[10px] border border-field-border bg-surface-2 px-2 py-1.5 text-sm text-ink";

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
        namespace="training.templates"
        templates={templates}
        saveAction={saveTrainingTemplateAction}
        loadAction={loadTrainingTemplateAction}
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
                  <span>{t("editor.exerciseLabel")}</span>
                </div>
                {exercises.map((exercise, rowIndex) => {
                  const base = `ex-${dayIndex}-${rowIndex}`;
                  return (
                    <div key={rowIndex} className="flex items-start gap-1.5">
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
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <input
                          name={`${base}-name`}
                          type="text"
                          maxLength={EXERCISE_NAME_MAX}
                          defaultValue={v(`${base}-name`, exercise.name)}
                          aria-label={t("editor.exerciseLabel")}
                          className={`w-full ${cell}`}
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
                      <button
                        type="button"
                        onClick={() =>
                          editDay(dayIndex, (list) =>
                            list.filter((_, i) => i !== rowIndex),
                          )
                        }
                        aria-label={t("editor.removeExercise")}
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-3 hover:text-error"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>
                      </button>
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

      <div className="sticky bottom-4 flex items-center gap-3 self-start">
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
