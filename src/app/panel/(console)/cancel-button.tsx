"use client";

import { useActionState, useState } from "react";
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
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="inline-flex h-8 items-center rounded-full border border-hairline px-3 text-xs font-medium text-error transition-[transform,background-color,border-color] hover:bg-error-soft active:scale-[0.97] active:duration-150"
      >
        {t("cancel")}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="invitationId" value={invitationId} />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-8 items-center rounded-full bg-error px-3 text-xs font-semibold text-on-destructive transition-[transform,background-color] hover:bg-error-hover active:scale-[0.97] active:duration-150 disabled:opacity-60"
      >
        {isPending ? t("cancelling") : t("confirmCancel")}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="inline-flex h-8 items-center rounded-full px-2 text-xs text-ink-subtle transition-colors hover:text-ink"
      >
        {t("keep")}
      </button>
      {state?.errorKey ? (
        <span role="alert" className="text-xs text-error">
          {t("cancelError")}
        </span>
      ) : null}
    </form>
  );
}
