"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { signOutAndContinue } from "./sign-out-action";

export function SignOutAndContinue({ invitationId }: { invitationId: string }) {
  const t = useTranslations("acceptInvitation");
  const [, formAction, isPending] = useActionState(signOutAndContinue, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="invitationId" value={invitationId} />
      <Button type="submit" disabled={isPending} variant="secondary" className="w-full">
        {isPending ? t("switchingAccount") : t("switchAccount")}
      </Button>
    </form>
  );
}
