"use server";

import { auth } from "@/lib/auth/server";
import { safeRedirect } from "@/lib/safe-redirect";
import { redirect } from "next/navigation";
import type { AuthFormState } from "../sign-in/actions";

export async function signUpWithEmail(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email") as string;

  if (!email) {
    return { errorKey: "emailRequired" };
  }

  const { error } = await auth.signUp.email({
    email,
    name: formData.get("name") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return { errorKey: "generic" };
  }

  redirect(safeRedirect(formData.get("redirectTo")));
}
