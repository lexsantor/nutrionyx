"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logSessionAction, type SessionFormState } from "./actions";

export function SessionForm({ doneToday }: { doneToday: boolean }) {
  const t = useTranslations("training.patient");
  const [state, formAction, isPending] = useActionState<
    SessionFormState,
    FormData
  >(logSessionAction, null);

  const done = doneToday || (state != null && "ok" in state);

  // The status region stays mounted across the form -> done swap so the
  // confirmation actually announces (WCAG 4.1.3).
  return (
    <>
      <div role="status">
        {done ? (
          <p className="inline-flex items-center gap-2 rounded-full bg-success-soft px-4 py-2 text-sm font-medium text-success">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
            {t("doneToday")}
          </p>
        ) : null}
      </div>
      {!done ? (
        <form action={formAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="note" className="text-sm font-medium">
                {t("noteLabel")}
              </label>
              <Input
                id="note"
                name="note"
                type="text"
                maxLength={500}
                placeholder={t("notePlaceholder")}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("logging") : t("logSession")}
            </Button>
          </div>
          {state && "errorKey" in state ? (
            <p
              role="alert"
              className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
            >
              {t(`errors.${state.errorKey}`)}
            </p>
          ) : null}
        </form>
      ) : null}
    </>
  );
}
