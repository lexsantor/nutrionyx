"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function signOutAndContinue(
  _prevState: null,
  formData: FormData,
): Promise<null> {
  const invitationId = formData.get("invitationId") as string;

  await auth.signOut();

  redirect(
    invitationId
      ? `/auth/accept-invitation?invitationId=${encodeURIComponent(invitationId)}`
      : "/",
  );
}
