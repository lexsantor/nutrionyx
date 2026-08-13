import { getTranslations, getFormatter } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import {
  getRoutine,
  listSessions,
} from "@/modules/training/repository";
import {
  formatPrescription,
  isEmptyRoutine,
  normalizeRoutine,
  type Exercise,
} from "@/modules/training/routine";
import { ExerciseThumb } from "@/components/exercise-thumb";
import { SessionForm } from "./session-form";
import { sameMadridDay, madridWeekdayIndex } from "@/modules/scheduling/time";

export const metadata = { title: "Mi entreno" };
export const dynamic = "force-dynamic";

/**
 * One day's prescription: series x reps, exercise, optional cue, and the
 * illustration where the catalogue has one. The image sits last so the
 * text columns stay aligned whether or not a given exercise is drawn.
 */
function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {exercises.map((exercise, i) => (
        <li
          key={i}
          className="flex items-start gap-3 border-b border-hairline pb-3 text-sm last:border-0 last:pb-0"
        >
          {formatPrescription(exercise) ? (
            <span className="w-16 shrink-0 tabular-nums text-ink-subtle">
              {formatPrescription(exercise)}
            </span>
          ) : null}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="leading-relaxed">{exercise.name}</span>
            {exercise.notes ? (
              <span className="text-xs text-ink-subtle">{exercise.notes}</span>
            ) : null}
          </span>
          <ExerciseThumb exerciseKey={exercise.key} className="size-24" />
        </li>
      ))}
    </ul>
  );
}

export default async function PatientTrainingPage() {
  const t = await getTranslations("training");
  const format = await getFormatter();

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    redirect("/");
  }

  const routine = await getRoutine(patient.organizationId, patient.id);
  const content = routine ? normalizeRoutine(routine.content) : null;
  const hasRoutine =
    routine != null && content != null && !isEmptyRoutine(content);

  const sessions = await listSessions(patient.organizationId, patient.id, 10);
  const doneToday =
    sessions[0] != null && sameMadridDay(sessions[0].sessionAt);

  const todayIndex = madridWeekdayIndex();

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">
            {routine?.title || t("patient.heading")}
          </h1>
          {routine ? (
            <p className="text-sm text-ink-subtle">
              {t("patient.updatedAt", {
                date: format.dateTime(routine.updatedAt, {
                  dateStyle: "long",
                }),
              })}
            </p>
          ) : null}
        </div>

        <section className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-6">
          <h2 className="text-lg font-semibold">{t("patient.todayTitle")}</h2>
          {hasRoutine && content.days[todayIndex].exercises.length > 0 ? (
            <ExerciseList exercises={content.days[todayIndex].exercises} />
          ) : hasRoutine ? (
            <p className="text-sm text-ink-subtle">{t("patient.restDay")}</p>
          ) : (
            <p className="text-sm text-ink-subtle">{t("patient.empty")}</p>
          )}
          <SessionForm doneToday={doneToday} />
        </section>

        {routine?.notes ? (
          <p className="rounded-xl border border-hairline bg-surface-1 p-4 text-sm leading-relaxed">
            {routine.notes}
          </p>
        ) : null}

        {hasRoutine ? (
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {content.days.map((day, dayIndex) => {
              if (day.exercises.length === 0 || dayIndex === todayIndex) {
                return null;
              }
              return (
                <section
                  key={dayIndex}
                  className="flex flex-col gap-2 rounded-xl border border-hairline bg-surface-1 p-5"
                >
                  <h2 className="text-base font-semibold capitalize">
                    {t(`days.${dayIndex}`)}
                  </h2>
                  <ExerciseList exercises={day.exercises} />
                </section>
              );
            })}
          </div>
        ) : !routine ? (
          <p className="rounded-xl border border-hairline bg-surface-1 p-6 text-sm text-ink-subtle">
            {t("patient.empty")}
          </p>
        ) : null}

        {sessions.length > 0 ? (
          <section className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-6">
            <h2 className="text-lg font-semibold">
              {t("patient.sessionsTitle")}
            </h2>
            <ul className="flex flex-col">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-baseline justify-between gap-4 border-b border-hairline py-2 last:border-0"
                >
                  <span className="text-sm">
                    {format.dateTime(s.sessionAt, { dateStyle: "medium" })}
                  </span>
                  {s.note ? (
                    <span className="truncate text-sm text-ink-subtle">
                      {s.note}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
