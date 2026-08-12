"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveTargetsAction, type TargetsFormState } from "./actions";

export function TargetsForm({
  patientId,
  initial,
}: {
  patientId: string;
  initial: {
    kcalTarget: number | null;
    proteinTargetG: number | null;
    sessionsPerWeek: number | null;
  } | null;
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
