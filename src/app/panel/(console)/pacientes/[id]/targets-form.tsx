"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveTargetsAction, type TargetsFormState } from "./actions";
import type { EnergyEstimate } from "@/modules/targets/energy";

export function TargetsForm({
  patientId,
  initial,
  energy,
}: {
  patientId: string;
  initial: {
    kcalTarget: number | null;
    proteinTargetG: number | null;
    sessionsPerWeek: number | null;
  } | null;
  /** Null when the assessment does not support an estimate; then nothing shows. */
  energy: EnergyEstimate | null;
}) {
  const t = useTranslations("targets.panel");
  const [state, formAction, isPending] = useActionState<
    TargetsFormState,
    FormData
  >(saveTargetsAction, null);

  const fields = [
    { name: "kcalTarget", value: initial?.kcalTarget, hint: "kcal" },
    { name: "proteinTargetG", value: initial?.proteinTargetG, hint: "g" },
    { name: "sessionsPerWeek", value: initial?.sessionsPerWeek, hint: "" },
  ] as const;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="patientId" value={patientId} />
      <div className="grid gap-3 sm:grid-cols-3">
        {fields.map((f) => (
          <div key={f.name} className="flex flex-col gap-1.5">
            <label htmlFor={f.name} className="text-sm font-medium">
              {t(`fields.${f.name}`)}
            </label>
            <Input
              id={f.name}
              name={f.name}
              type="text"
              inputMode="numeric"
              defaultValue={f.value ?? ""}
              placeholder={f.hint}
            />
          </div>
        ))}
      </div>
      {energy ? (
        <div className="flex flex-col gap-1.5 rounded-[10px] bg-info-soft px-3 py-2.5">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-info">
            <span>
              {t(`suggestion.${energy.basis}`, {
                kcal: energy.maintenanceKcal,
                bmr: energy.bmr,
                factor: energy.activityFactor,
              })}
            </span>
            <button
              type="button"
              // The field is uncontrolled, like every other one here, so the
              // value goes straight to the DOM node. Threading a ref would
              // mean widening the shared Input primitive for one button.
              onClick={() => {
                const field = document.getElementById("kcalTarget");
                if (field instanceof HTMLInputElement) {
                  field.value = String(energy.maintenanceKcal);
                  field.focus();
                }
              }}
              className="rounded-full bg-info px-2.5 py-0.5 text-xs font-semibold text-surface-1 transition-opacity hover:opacity-90"
            >
              {t("suggestion.use")}
            </button>
          </p>
          <p className="text-xs text-info">{t("suggestion.caveat")}</p>
        </div>
      ) : null}
      <p className="text-xs text-ink-subtle">{t("hint")}</p>
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
