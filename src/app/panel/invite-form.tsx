"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invitePatient, type InviteFormState } from "./actions";

export function InviteForm() {
  const t = useTranslations("panel.invite");
  const [state, formAction, isPending] = useActionState<
    InviteFormState,
    FormData
  >(invitePatient, null);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6"
    >
      <h3 className="font-semibold">{t("title")}</h3>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="fullName" className="text-sm font-medium">
            {t("name")}
          </label>
          <Input id="fullName" name="fullName" type="text" required />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            {t("email")}
          </label>
          <Input id="email" name="email" type="email" required />
        </div>
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
          {t("sent")}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
