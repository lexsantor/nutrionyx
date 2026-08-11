"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { erasePatientAction, type EraseFormState } from "./actions";

export function EraseForm({ patientId }: { patientId: string }) {
  const t = useTranslations("erase");
  const [confirmed, setConfirmed] = useState(false);
  const [state, formAction, isPending] = useActionState<
    EraseFormState,
    FormData
  >(erasePatientAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="patientId" value={patientId} />
      <label className="flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          name="confirm"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 size-4 accent-[var(--c-error)]"
        />
        <span className="text-ink-subtle">{t("confirmLabel")}</span>
      </label>
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
