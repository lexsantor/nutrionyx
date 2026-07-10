"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { cancelInvitation, type CancelFormState } from "./actions";

export function CancelInvitationButton({
  invitationId,
}: {
  invitationId: string;
}) {
  const t = useTranslations("panel.invitations");
  const [state, formAction, isPending] = useActionState<
    CancelFormState,
    FormData
  >(cancelInvitation, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="invitationId" value={invitationId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full border border-hairline px-3 py-0.5 text-xs font-medium text-error transition-colors hover:bg-error-soft disabled:opacity-60"
      >
        {isPending ? t("cancelling") : t("cancel")}
      </button>
      {state?.errorKey ? (
        <span role="alert" className="text-xs text-error">
          {t("cancelError")}
        </span>
      ) : null}
    </form>
  );
}
