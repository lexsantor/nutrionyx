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

/**
 * One card per training day. Single column rather than two: a routine has
 * three or four days, each row carries an illustration, and squeezing that
 * into half a page would shrink the one thing worth looking at.
 *
 * Rest days are omitted: a printed sheet of "nothing today" is paper spent
 * on absence.
 */
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
      kind={t("editor.heading")}
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
      notesLabel={tp("notes")}
      footer={routine?.notes ?? null}
    >
      {!content || isEmptyRoutine(content) ? (
        <p className="text-sm text-ink-subtle">{tp("emptyRoutine")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {content.days.map((day, dayIndex) => {
            if (day.exercises.length === 0) return null;
            return (
              <section
                key={dayIndex}
                className="flex break-inside-avoid flex-col overflow-hidden rounded-[10px] border border-hairline"
              >
                <h2 className="flex items-baseline justify-between gap-3 bg-surface-3 px-4 py-1.5">
                  <span className="font-display text-sm font-semibold capitalize tracking-tight">
                    {t(`days.${dayIndex}`)}
                  </span>
                  <span className="text-[11px] text-ink-subtle">
                    {tp("exerciseCount", { count: day.exercises.length })}
                  </span>
                </h2>
                <ul className="flex flex-col divide-y divide-hairline">
                  {day.exercises.map((exercise, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 px-4 py-2"
                    >
                      <ExerciseThumb
                        exerciseKey={exercise.key}
                        className="size-14"
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-medium leading-snug">
                          {exercise.name}
                        </span>
                        {exercise.notes ? (
                          <span className="text-xs leading-snug text-ink-subtle">
                            {exercise.notes}
                          </span>
                        ) : null}
                      </span>
                      {/* The prescription is what the patient checks between
                          sets, so it reads as a value, not as a caption. */}
                      {formatPrescription(exercise) ? (
                        <span className="shrink-0 whitespace-nowrap rounded-full bg-primary-subtle px-2.5 py-1 text-sm font-semibold tabular-nums text-on-primary-subtle">
                          {formatPrescription(exercise)}
                        </span>
                      ) : null}
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
