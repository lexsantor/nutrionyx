"use server";

import { auth } from "@/lib/auth/server";
import { appUrl } from "@/lib/email";

export type ForgotFormState = { ok: true } | null;

/**
 * Always resolves to ok: whether the address exists is never revealed
 * (account enumeration). Neon Auth sends the reset email with a link to
 * /auth/reset-password?token=...
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
      // Logged only: the response to the user is identical either way.
      console.error("[requestPasswordReset] failed", error);
    }
  }
  return { ok: true };
}
