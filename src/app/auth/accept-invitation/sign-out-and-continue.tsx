"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signOutAndContinue } from "./sign-out-action";

export function SignOutAndContinue({ invitationId }: { invitationId: string }) {
  const t = useTranslations("acceptInvitation");
  const [, formAction, isPending] = useActionState(signOutAndContinue, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="invitationId" value={invitationId} />
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? t("switchingAccount") : t("switchAccount")}
      </button>
    </form>
  );
}
