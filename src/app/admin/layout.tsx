import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import { AdminShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

// The platform area was a single page behind the legacy Topbar. The guard
// moves here with the shell, so each page under /admin stops repeating it.
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const role = await resolveUserRole(session.user.id);
  if (role !== "platform-admin") redirect(roleHome(role));

  return <AdminShell>{children}</AdminShell>;
}
