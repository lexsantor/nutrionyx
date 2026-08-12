import type { ReactNode } from "react";
import { requirePatient } from "@/lib/auth/patient";
import { PatientShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

// The shell lives in the layout so the sidebar persists across navigations,
// mirroring the console. The guard runs here too: every page under
// /mi-espacio needs a Patient row behind the session.
export default async function PatientLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePatient();
  return <PatientShell>{children}</PatientShell>;
}
