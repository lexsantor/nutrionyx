import type { ReactNode } from "react";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { ConsoleShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

// The console shell lives in the layout so the sidebar persists across
// navigations and per-segment loading states replace only the content area.
export default async function ConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSpecialistOrg();
  return <ConsoleShell>{children}</ConsoleShell>;
}
