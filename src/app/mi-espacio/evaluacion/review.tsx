"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-6 px-4 py-12">
      <div>
        <p className="text-sm text-ink-subtle">
          {t("progress", { step: totalSteps, total: totalSteps })}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          {t("review.title")}
        </h1>
        <p className="mt-1 text-sm text-ink-subtle">{t("review.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {entries.map((entry, index) => (
          <Link
            key={entry.field}
            href={`/mi-espacio/evaluacion?paso=${index}`}
            aria-label={`${t("back")}: ${t(`fields.${entry.field}.title`)}`}
            className="group flex flex-col gap-1 rounded-xl border border-hairline bg-surface-1 p-4 shadow-el-sm transition-[transform,box-shadow,border-color,background-color,color] duration-500 ease-house hover:-translate-y-0.5 hover:border-hairline-strong hover:shadow-el-md active:scale-[0.99] active:duration-150"
          >
            <span className="flex items-center justify-between gap-2 text-xs font-medium text-ink-subtle">
              {t(`fields.${entry.field}.title`)}
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0 opacity-0 transition-opacity duration-500 ease-house group-hover:opacity-100"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </span>
            <span
              className={`text-base font-semibold ${
                entry.display ? "" : "font-normal text-ink-subtle"
              }`}
            >
              {entry.display ?? t("review.empty")}
            </span>
          </Link>
        ))}

        <div className="flex items-center justify-between gap-4 rounded-xl border border-primary bg-primary-subtle p-4 sm:col-span-2">
          <span className="text-sm font-medium">{t("review.bmiPreview")}</span>
          <span className="font-display text-3xl font-semibold tabular-nums">
            {bmiPreview}
          </span>
        </div>
      </div>

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
      <p className="text-center text-xs text-ink-subtle">
        {t("review.editHint")}
      </p>
    </main>
  );
}
