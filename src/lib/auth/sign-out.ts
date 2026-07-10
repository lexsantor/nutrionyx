"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

/**
 * Global sign-out. Ends the session and returns to the public home, which
 * routes the (now anonymous) visitor to the sign-in entry points.
 */
export async function signOut(): Promise<void> {
  await auth.signOut();
  redirect("/");
}
