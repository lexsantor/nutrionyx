"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recordWeightAction, type WeightFormState } from "./actions";

export function WeightCheckIn() {
  const t = useTranslations("progress");
  const [state, formAction, isPending] = useActionState<
    WeightFormState,
    FormData
  >(recordWeightAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="weightKg" className="text-sm font-medium">
            {t("weightLabel")}
          </label>
          <Input
            id="weightKg"
            name="weightKg"
            type="text"
            inputMode="decimal"
            required
            placeholder="72,4"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="recordedAt" className="text-sm font-medium">
            {t("dateLabel")}
          </label>
          <Input id="recordedAt" name="recordedAt" type="date" />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? t("saving") : t("save")}
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
      {state && "ok" in state ? (
        <p
          role="status"
          className="rounded-[10px] bg-success-soft px-3 py-2 text-sm text-success"
        >
          {t("saved")}
        </p>
      ) : null}
    </form>
  );
}
