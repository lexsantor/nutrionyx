"use server";

import { auth } from "@/lib/auth/server";
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
    // Error details are logged server-side by the SDK; the user gets a
    // translated, non-leaking message (key resolved in the client form).
    return { errorKey: "invalidCredentials" };
  }

  redirect("/");
}
