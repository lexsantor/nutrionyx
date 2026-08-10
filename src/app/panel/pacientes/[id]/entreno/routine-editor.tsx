"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RoutineContent } from "@/modules/training/routine";
import { saveRoutineAction, type RoutineFormState } from "./actions";

export function RoutineEditor({
  patientId,
  initial,
}: {
  patientId: string;
  initial: {
    title: string | null;
    notes: string | null;
    content: RoutineContent;
  };
}) {
  const t = useTranslations("training");
  const [state, formAction, isPending] = useActionState<
    RoutineFormState,
    FormData
  >(saveRoutineAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-6">
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
            defaultValue={initial.title ?? ""}
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
            defaultValue={initial.notes ?? ""}
            placeholder={t("editor.notesPlaceholder")}
            className="block w-full resize-y rounded-[10px] border border-field-border bg-surface-2 px-3.5 py-2.5 text-base text-ink placeholder:text-ink-tertiary"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {initial.content.days.map((day, dayIndex) => (
          <div key={dayIndex} className="flex flex-col gap-1.5">
            <label
              htmlFor={`day-${dayIndex}`}
              className="text-sm font-medium capitalize"
            >
              {t(`days.${dayIndex}`)}
            </label>
            <textarea
              id={`day-${dayIndex}`}
              name={`day-${dayIndex}`}
              rows={4}
              maxLength={2000}
              defaultValue={day}
              placeholder={t("editor.dayPlaceholder")}
              className="block w-full resize-y rounded-[10px] border border-field-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary"
            />
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 flex items-center gap-3 self-start">
        <Button type="submit" disabled={isPending}>
          {isPending ? t("editor.saving") : t("editor.save")}
        </Button>
        {state && "ok" in state ? (
          <span
            role="status"
            className="rounded-full bg-success-soft px-3 py-1.5 text-sm text-success"
          >
            {t("editor.saved")}
          </span>
        ) : null}
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
