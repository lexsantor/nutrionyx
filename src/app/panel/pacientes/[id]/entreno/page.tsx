import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { getPatientDetail } from "@/modules/patient/repository";
import { getRoutine } from "@/modules/training/repository";
import {
  emptyRoutine,
  normalizeRoutine,
  type RoutineContent,
} from "@/modules/training/routine";
import { ConsoleShell } from "@/components/console-shell";
import { RoutineEditor } from "./routine-editor";

export const dynamic = "force-dynamic";

export default async function RoutineEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("training");

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  const role = await resolveUserRole(session.user.id);
  if (role !== "nutritionist") {
    redirect(roleHome(role));
  }
  const { data: organizations } = await auth.organization.list();
  if (!organizations || organizations.length === 0) {
    redirect("/panel/nueva-organizacion");
  }
  const active = organizations[0];
  const org = await ensureOrganization(active.id, active.name);

  const patient = await getPatientDetail(org.id, id);
  if (!patient) {
    notFound();
  }

  const routine = await getRoutine(org.id, patient.id);
  const content: RoutineContent =
    (routine && normalizeRoutine(routine.content)) || emptyRoutine();

  return (
    <ConsoleShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href={`/panel/pacientes/${patient.id}`}
            className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-subtle no-underline transition-colors hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            {patient.fullName}
          </Link>
          <h1 className="text-2xl font-semibold">{t("editor.heading")}</h1>
          <p className="text-sm text-ink-subtle">{t("editor.hint")}</p>
        </div>

        <RoutineEditor
          patientId={patient.id}
          initial={{
            title: routine?.title ?? null,
            notes: routine?.notes ?? null,
            content,
          }}
        />
      </div>
    </ConsoleShell>
  );
}
