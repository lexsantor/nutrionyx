"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MEAL_SLOTS, type DietPlanContent } from "@/modules/diet/plan";
import { saveDietPlanAction, type DietPlanFormState } from "./actions";

export function DietEditor({
  patientId,
  initial,
}: {
  patientId: string;
  initial: {
    title: string | null;
    notes: string | null;
    content: DietPlanContent;
  };
}) {
  const t = useTranslations("diet");
  const [state, formAction, isPending] = useActionState<
    DietPlanFormState,
    FormData
  >(saveDietPlanAction, null);

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
            className="block w-full resize-y rounded-[10px] border border-field-border bg-surface-2 px-3.5 py-2.5 text-base text-ink placeholder:text-ink-subtle"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {initial.content.days.map((day, dayIndex) => (
          <section
            key={dayIndex}
            className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-5"
          >
            <h2 className="text-base font-semibold capitalize">
              {t(`days.${dayIndex}`)}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MEAL_SLOTS.map((slot) => (
                <div key={slot} className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`meal-${dayIndex}-${slot}`}
                    className="text-xs font-medium text-ink-subtle"
                  >
                    {t(`slots.${slot}`)}
                  </label>
                  <textarea
                    id={`meal-${dayIndex}-${slot}`}
                    name={`meal-${dayIndex}-${slot}`}
                    rows={2}
                    maxLength={1000}
                    defaultValue={day[slot] ?? ""}
                    className="block w-full resize-y rounded-[10px] border border-field-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-ink-subtle"
                  />
                </div>
              ))}
            </div>
          </section>
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
