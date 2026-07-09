"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
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
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
