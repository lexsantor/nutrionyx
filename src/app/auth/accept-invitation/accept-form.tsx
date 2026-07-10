"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { acceptInvitation, type AcceptFormState } from "./actions";

export function AcceptForm({ invitationId }: { invitationId: string }) {
  const t = useTranslations("acceptInvitation");
  const [state, formAction, isPending] = useActionState<
    AcceptFormState,
    FormData
  >(acceptInvitation, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="invitationId" value={invitationId} />

      {state?.errorKey ? (
        <p
          role="alert"
          className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
        >
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
