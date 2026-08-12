"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  recordBodyMetricsAction,
  type BodyMetricsFormState,
} from "./actions";

export function BodyMetricsForm() {
  const t = useTranslations("body");
  const [state, formAction, isPending] = useActionState<
    BodyMetricsFormState,
    FormData
  >(recordBodyMetricsAction, null);

  const fields = [
    "chestCm",
    "armCm",
    "waistCm",
    "hipCm",
    "thighCm",
    "gluteCm",
    "calfCm",
    "bodyFatPct",
  ] as const;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {fields.map((name) => (
          <div key={name} className="flex flex-col gap-1.5">
            <label htmlFor={name} className="text-sm font-medium">
              {t(`fields.${name}`)}
            </label>
            <Input
              id={name}
              name={name}
              type="text"
              inputMode="decimal"
              placeholder={t(`placeholders.${name}`)}
            />
          </div>
        ))}
      </div>
      <Button
        type="submit"
        variant="secondary"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? t("saving") : t("save")}
      </Button>

      {state && "errorKey" in state ? (
        <p
          role="alert"
          className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
        >
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}
      <div role="status">
        {state && "ok" in state ? (
          <p
          className="rounded-[10px] bg-success-soft px-3 py-2 text-sm text-success"
        >
          {t("saved")}
        </p>
        ) : null}
        </div>
    </form>
  );
}
