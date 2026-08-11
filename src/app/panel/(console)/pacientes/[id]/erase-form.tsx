"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { erasePatientAction, type EraseFormState } from "./actions";

export function EraseForm({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const t = useTranslations("erase");
  const [typed, setTyped] = useState("");
  const confirmed = typed.trim() === patientName;
  const [state, formAction, isPending] = useActionState<
    EraseFormState,
    FormData
  >(erasePatientAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="patientId" value={patientId} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="erase-confirm" className="text-sm text-ink-subtle">
          {t("typeToConfirm", { name: patientName })}
        </label>
        <input
          id="erase-confirm"
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          className="block w-full max-w-xs rounded-[10px] border border-field-border bg-surface-2 px-3.5 py-2.5 text-sm text-ink"
        />
        <input type="hidden" name="confirm" value={confirmed ? "on" : ""} />
      </div>
      <Button
        type="submit"
        variant="destructive"
        disabled={!confirmed || isPending}
        className="self-start"
      >
        {isPending ? t("erasing") : t("erase")}
      </Button>
      {state?.errorKey ? (
        <p
          role="alert"
          className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
        >
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}
    </form>
  );
}
