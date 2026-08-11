import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { getPatientDetail } from "@/modules/patient/repository";
import { getRoutine } from "@/modules/training/repository";
import {
  emptyRoutine,
  normalizeRoutine,
  type RoutineContent,
} from "@/modules/training/routine";
import { RoutineEditor } from "./routine-editor";

export const dynamic = "force-dynamic";

export default async function RoutineEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("training");

  const { org } = await requireSpecialistOrg();

  const patient = await getPatientDetail(org.id, id);
  if (!patient) {
    notFound();
  }

  const routine = await getRoutine(org.id, patient.id);
  const content: RoutineContent =
    (routine && normalizeRoutine(routine.content)) || emptyRoutine();

  return (
    <>
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
    </>
  );
}
