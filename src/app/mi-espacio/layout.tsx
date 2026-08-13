import type { ReactNode } from "react";
import { requirePatient } from "@/lib/auth/patient";
import { PatientShell } from "@/components/app-shell";
import { getPlan } from "@/modules/medication/repository";

export const dynamic = "force-dynamic";

// The shell lives in the layout so the sidebar persists across navigations,
// mirroring the console. The guard runs here too: every page under
// /mi-espacio needs a Patient row behind the session.
export default async function PatientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { patient } = await requirePatient();
  // The medication entry exists only for a patient who has a plan. Turning it
  // on is a deliberate act in the profile, not a tab everyone has to ignore.
  const plan = await getPlan(patient.organizationId, patient.id);
  return (
    <PatientShell showMedication={plan !== null}>{children}</PatientShell>
  );
}
