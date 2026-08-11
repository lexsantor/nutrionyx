"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export type ResetFormState = { errorKey: string } | null;

export async function resetPassword(
  _prevState: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
  const token = formData.get("token") as string;
  const newPassword = formData.get("password") as string;

  if (!token) {
    return { errorKey: "invalidToken" };
  }
  if (!newPassword || newPassword.length < 8) {
    return { errorKey: "weakPassword" };
  }

  const { error } = await auth.resetPassword({ newPassword, token });
  if (error) {
    console.error("[resetPassword] failed", error);
    return { errorKey: "invalidToken" };
  }

  redirect("/auth/sign-in?reset=1");
}
