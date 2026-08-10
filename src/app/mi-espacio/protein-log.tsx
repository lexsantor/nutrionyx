"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recordProteinAction, type ProteinFormState } from "./actions";

export function ProteinLog() {
  const t = useTranslations("targets.today");
  const [state, formAction, isPending] = useActionState<
    ProteinFormState,
    FormData
  >(recordProteinAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="grams" className="text-sm font-medium">
            {t("proteinAddLabel")}
          </label>
          <Input
            id="grams"
            name="grams"
            type="text"
            inputMode="decimal"
            required
            placeholder="30"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={isPending}>
          {isPending ? t("adding") : t("add")}
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
  );
}
