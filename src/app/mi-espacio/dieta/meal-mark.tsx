"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { markMealAction, noteMealAction, type MealLogState } from "./actions";
import {
  MEAL_NOTE_MAX,
  keepsNote,
  type MealMark as Mark,
} from "@/modules/diet/meal-status";

const OPTIONS = ["DONE", "CHANGED", "SKIPPED"] as const;

/**
 * Three buttons under today's meal. Buttons and not a select: the whole point
 * is that a day's check-in stays under a minute, and three taps beat three
 * menus.
 *
 * Each button posts its own value, and the active one posts an empty status,
 * which clears the mark. A patient who taps "saltada" by mistake has a way
 * back that is not "ask your specialist".
 *
 * The note appears only once the plan and reality diverged, and stays
 * optional: the tap is the check-in, the note is a bonus. Before it existed
 * the specialist saw that a meal had changed and nothing about what to.
 */
export function MealMark({
  slot,
  current,
}: {
  slot: string;
  current: Mark | undefined;
}) {
  const t = useTranslations("diet.log");
  const [, formAction, isPending] = useActionState<MealLogState, FormData>(
    markMealAction,
    null,
  );
  const [noteState, noteAction, notePending] = useActionState<
    MealLogState,
    FormData
  >(noteMealAction, null);

  const status = current?.status;

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction} className="flex flex-wrap gap-1.5">
        <input type="hidden" name="slot" value={slot} />
        {OPTIONS.map((option) => {
          const active = status === option;
          return (
            <button
              key={option}
              type="submit"
              name="status"
              value={active ? "" : option}
              disabled={isPending}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                active
                  ? "border-primary bg-primary text-on-primary"
                  : "border-hairline bg-surface-1 text-ink-subtle hover:border-hairline-strong hover:text-ink"
              }`}
            >
              {t(`status.${option}`)}
            </button>
          );
        })}
      </form>

      {keepsNote(status ?? null) ? (
        <form action={noteAction} className="flex flex-col gap-1.5">
          <input type="hidden" name="slot" value={slot} />
          <label htmlFor={`note-${slot}`} className="text-xs text-ink-subtle">
            {t(`note.label.${status}`)}
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              id={`note-${slot}`}
              name="note"
              type="text"
              maxLength={MEAL_NOTE_MAX}
              // Re-read on every status change so switching meals does not
              // carry the previous note into the next field (React reads a
              // defaultValue once per mount, and the key forces a fresh one).
              key={`${slot}-${status}-${current?.note ?? ""}`}
              defaultValue={current?.note ?? ""}
              placeholder={t(`note.placeholder.${status}`)}
              className="h-9 min-w-0 flex-1 rounded-[10px] border border-field-border bg-surface-2 px-3 text-sm text-ink placeholder:text-ink-subtle"
            />
            <button
              type="submit"
              disabled={notePending}
              className="rounded-full border border-hairline bg-surface-1 px-3 py-1.5 text-xs font-medium text-ink-subtle transition-colors hover:border-hairline-strong hover:text-ink disabled:opacity-60"
            >
              {notePending ? t("note.saving") : t("note.save")}
            </button>
          </div>
          <div role="status">
            {noteState && "ok" in noteState ? (
              <p className="text-xs text-success">{t("note.saved")}</p>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
