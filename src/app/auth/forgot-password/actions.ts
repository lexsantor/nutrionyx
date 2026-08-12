"use server";

import { auth } from "@/lib/auth/server";
import { appUrl } from "@/lib/email";

export type ForgotFormState = { ok: true } | { errorKey: string } | null;

/**
 * Never reveals whether the address exists (account enumeration): the
 * success response is identical for known and unknown addresses. A
 * transport failure is different — it says so, because silently claiming
 * "check your inbox" for an email that was never sent is worse.
 */
export async function requestPasswordReset(
  _prevState: ForgotFormState,
  formData: FormData,
): Promise<ForgotFormState> {
  const email = (formData.get("email") as string)?.trim();
  if (email) {
    const { error } = await auth.requestPasswordReset({
      email,
      redirectTo: `${appUrl()}/auth/reset-password`,
    });
    if (error) {
      console.error("[requestPasswordReset] failed", error);
      return { errorKey: "transport" };
    }
  }
  return { ok: true };
}
