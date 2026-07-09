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
        className="rounded-md border border-red-200 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        {isPending ? t("cancelling") : t("cancel")}
      </button>
      {state?.errorKey ? (
        <span role="alert" className="text-xs text-red-700">
          {t("cancelError")}
        </span>
      ) : null}
    </form>
  );
}
