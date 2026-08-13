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
 * Training days across, exercises down.
 *
 * Stacked, one day took a third of a page and the sheet grew every time an
 * exercise gained an illustration, which is the wrong direction: drawings
 * are supposed to make it easier to read, not longer. As columns the day
 * count sets the width and the illustration rides along at a size a
 * patient can still recognise.
 *
 * Landscape and one page, same as the diet sheet, so the pair matches.
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

  const days = (content?.days ?? [])
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => day.exercises.length > 0);
  // A three-day routine leaves two thirds of a landscape sheet empty, so
  // the drawing takes the room rather than the paper wasting it. Past four
  // columns the space is genuinely spoken for and it shrinks back.
  const roomy = days.length <= 4;
  const thumb = roomy ? "size-16" : "size-9";

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
      fiscal={[
        profile?.legalName,
        profile?.taxId,
        profile?.addressLine,
        [profile?.postalCode, profile?.locality].filter(Boolean).join(" ") || null,
        profile?.hours,
      ].filter((part): part is string => Boolean(part && part.trim()))}
      footer={routine?.notes ?? null}
    >
      {!content || isEmptyRoutine(content) || days.length === 0 ? (
        <p className="text-sm text-ink-subtle">{tp("emptyRoutine")}</p>
      ) : (
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
          }}
        >
          {days.map(({ day, index }) => (
            <section
              key={index}
              className="flex break-inside-avoid flex-col overflow-hidden rounded-[8px] border border-hairline"
            >
              <h2 className="bg-surface-3 px-2 py-1 font-display text-[9pt] font-semibold capitalize tracking-tight">
                {t(`days.${index}`)}
              </h2>
              <ul className="flex flex-col divide-y divide-hairline">
                {day.exercises.map((exercise, i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-2 px-2 ${roomy ? "py-2" : "py-1"}`}
                  >
                    <ExerciseThumb exerciseKey={exercise.key} className={thumb} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className={`${roomy ? "text-[10pt]" : "text-[8.5pt]"} font-medium leading-tight`}>
                        {exercise.name}
                      </span>
                      {exercise.notes ? (
                        <span className={`${roomy ? "text-[8pt]" : "text-[7pt]"} leading-tight text-ink-subtle`}>
                          {exercise.notes}
                        </span>
                      ) : null}
                    </span>
                    {formatPrescription(exercise) ? (
                      <span className={`shrink-0 whitespace-nowrap rounded-full bg-primary-subtle px-2 py-0.5 ${roomy ? "text-[9.5pt]" : "text-[8pt]"} font-semibold tabular-nums text-on-primary-subtle`}>
                        {formatPrescription(exercise)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </PrintFrame>
  );
}
