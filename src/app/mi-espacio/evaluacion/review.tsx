"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ASSESSMENT_STEPS } from "@/modules/assessment/definition";
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
        <h1 className="text-xl font-bold">{t("review.title")}</h1>
        <p className="mt-1 text-sm text-zinc-600">{t("review.subtitle")}</p>
      </div>

      <dl className="flex flex-col divide-y divide-zinc-100 rounded-lg border border-zinc-200">
        {entries.map((entry, index) => (
          <div key={entry.field} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="text-zinc-500">{t(`fields.${entry.field}.title`)}</dt>
            <dd className="flex items-center gap-3 text-right font-medium">
              {entry.display ?? t("review.empty")}
              <Link
                href={`/mi-espacio/evaluacion?paso=${index}`}
                className="text-xs font-normal text-zinc-500 underline"
                aria-label={`${t("back")}: ${t(`fields.${entry.field}.title`)}`}
              >
                {t("progress", { step: index + 1, total: totalSteps })}
              </Link>
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 bg-zinc-50 px-4 py-2.5 text-sm">
          <dt className="font-medium">{t("review.bmiPreview")}</dt>
          <dd className="font-bold">{bmiPreview}</dd>
        </div>
      </dl>

      {state?.errorKey ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}

      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {isPending ? t("review.completing") : t("review.complete")}
        </button>
      </form>
    </main>
  );
}

export const REVIEW_STEP_COUNT = ASSESSMENT_STEPS.length;
