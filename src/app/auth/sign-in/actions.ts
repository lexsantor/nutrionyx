"use server";

import { auth } from "@/lib/auth/server";
import { safeRedirect } from "@/lib/safe-redirect";
import { redirect } from "next/navigation";

export type AuthFormState = { errorKey: string } | null;

export async function signInWithEmail(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { error } = await auth.signIn.email({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    console.error("[signInWithEmail] auth.signIn.email failed", error);
    return { errorKey: "invalidCredentials" };
  }

  redirect(safeRedirect(formData.get("redirectTo")));
}
