"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ASSESSMENT_STEPS } from "@/modules/assessment/definition";
import { Button } from "@/components/ui/button";
import { completeAction, type WizardFormState } from "./actions";

export type ReviewEntry = {
  field: string;
  display: string | null;
};

export function Review({
  entries,
  bmiPreview,
  totalSteps,
}: {
  entries: ReviewEntry[];
  bmiPreview: number;
  totalSteps: number;
}) {
  const t = useTranslations("wizard");
  const [state, formAction, isPending] = useActionState<
    WizardFormState,
    FormData
  >(completeAction, null);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold">{t("review.title")}</h1>
        <p className="mt-1 text-sm text-ink-subtle">{t("review.subtitle")}</p>
      </div>

      <dl className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline">
        {entries.map((entry, index) => (
          <div
            key={entry.field}
            className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
          >
            <dt className="text-ink-subtle">{t(`fields.${entry.field}.title`)}</dt>
            <dd className="flex items-center gap-3 text-right font-medium">
              {entry.display ?? t("review.empty")}
              <Link
                href={`/mi-espacio/evaluacion?paso=${index}`}
                className="text-xs font-normal text-ink-subtle underline underline-offset-2"
                aria-label={`${t("back")}: ${t(`fields.${entry.field}.title`)}`}
              >
                {t("progress", { step: index + 1, total: totalSteps })}
              </Link>
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 rounded-b-xl bg-surface-2 px-4 py-2.5 text-sm">
          <dt className="font-medium">{t("review.bmiPreview")}</dt>
          <dd className="font-semibold">{bmiPreview}</dd>
        </div>
      </dl>

      {state?.errorKey ? (
        <p
          role="alert"
          className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
        >
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}

      <form action={formAction}>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? t("review.completing") : t("review.complete")}
        </Button>
      </form>
    </main>
  );
}

export const REVIEW_STEP_COUNT = ASSESSMENT_STEPS.length;
