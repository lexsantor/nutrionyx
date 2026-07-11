"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import {
  createAccessCode,
  isPlatformAdmin,
  revokeAccessCode,
} from "@/modules/platform-admin/repository";

async function requireAdmin(): Promise<string | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  return (await isPlatformAdmin(session.user.id)) ? session.user.id : null;
}

export type CodeFormState =
  | { errorKey: string }
  | { ok: true; code: string }
  | null;

export async function generateCodeAction(
  _prevState: CodeFormState,
  formData: FormData,
): Promise<CodeFormState> {
  const adminId = await requireAdmin();
  if (!adminId) {
    console.error("[generateCodeAction] non-admin attempted to mint a code");
    return { errorKey: "generic" };
  }
  const note = ((formData.get("note") as string) ?? "").trim();
  const code = await createAccessCode({
    note: note || undefined,
    createdBy: adminId,
  });
  revalidatePath("/admin");
  return { ok: true, code };
}

export async function revokeCode(formData: FormData): Promise<void> {
  const adminId = await requireAdmin();
  if (!adminId) {
    console.error("[revokeCode] non-admin attempted to revoke a code");
    return;
  }
  const code = (formData.get("code") as string) ?? "";
  await revokeAccessCode(code);
  revalidatePath("/admin");
}
