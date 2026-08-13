import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { getPatientDetail } from "@/modules/patient/repository";
import { getRoutine } from "@/modules/training/repository";
import { getOrgProfile } from "@/modules/organization/repository";
import {
  formatPrescription,
  isEmptyRoutine,
  normalizeRoutine,
} from "@/modules/training/routine";
import { ExerciseThumb } from "@/components/exercise-thumb";
import { PrintFrame } from "../../print-frame";

export const metadata = { title: "Rutina de entrenamiento" };
export const dynamic = "force-dynamic";

/** One block per training day. Rest days are omitted: a printed sheet of
 *  "nothing today" is paper spent on absence. */
export default async function RoutinePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("training");
  const tp = await getTranslations("print");
  const format = await getFormatter();
  const { org } = await requireSpecialistOrg();

  const patient = await getPatientDetail(org.id, id);
  if (!patient) notFound();

  const [routine, profile] = await Promise.all([
    getRoutine(org.id, patient.id),
    getOrgProfile(org.id),
  ]);
  const content = routine ? normalizeRoutine(routine.content) : null;

  return (
    <PrintFrame
      consulta={profile?.name ?? org.name}
      logoUrl={profile?.logoUrl ?? null}
      patientName={patient.fullName ?? patient.email}
      title={routine?.title || t("editor.heading")}
      subtitle={
        routine
          ? tp("updatedAt", {
              date: format.dateTime(routine.updatedAt, { dateStyle: "long" }),
            })
          : null
      }
      printLabel={tp("print")}
      backHref={`/panel/pacientes/${patient.id}/entreno`}
      backLabel={tp("back")}
      footer={routine?.notes ?? null}
    >
      {!content || isEmptyRoutine(content) ? (
        <p className="text-sm text-ink-subtle">{tp("emptyRoutine")}</p>
      ) : (
        <div className="flex flex-col gap-5">
          {content.days.map((day, dayIndex) => {
            if (day.exercises.length === 0) return null;
            return (
              <section
                key={dayIndex}
                className="flex break-inside-avoid flex-col gap-2"
              >
                <h2 className="border-b border-hairline pb-1 font-display text-base font-semibold capitalize">
                  {t(`days.${dayIndex}`)}
                </h2>
                <ul className="flex flex-col gap-2">
                  {day.exercises.map((exercise, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-16 shrink-0 tabular-nums text-ink-subtle">
                        {formatPrescription(exercise)}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="leading-relaxed">{exercise.name}</span>
                        {exercise.notes ? (
                          <span className="text-xs text-ink-subtle">
                            {exercise.notes}
                          </span>
                        ) : null}
                      </span>
                      <ExerciseThumb
                        exerciseKey={exercise.key}
                        className="size-16"
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </PrintFrame>
  );
}
