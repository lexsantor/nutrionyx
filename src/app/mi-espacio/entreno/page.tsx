import { getTranslations, getFormatter } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import {
  getRoutine,
  listSessions,
} from "@/modules/training/repository";
import {
  isEmptyRoutine,
  normalizeRoutine,
} from "@/modules/training/routine";
import { Topbar } from "@/components/topbar";
import { PatientNav } from "../patient-nav";
import { SessionForm } from "./session-form";
import { sameMadridDay, madridWeekdayIndex } from "@/modules/scheduling/time";

export const dynamic = "force-dynamic";

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
      <Topbar nav={<PatientNav />} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
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
          {hasRoutine && content.days[todayIndex] ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {content.days[todayIndex]}
            </p>
          ) : (
            <p className="text-sm text-ink-subtle">{t("patient.restDay")}</p>
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
              if (!day || dayIndex === todayIndex) return null;
              return (
                <section
                  key={dayIndex}
                  className="flex flex-col gap-2 rounded-xl border border-hairline bg-surface-1 p-5"
                >
                  <h2 className="text-base font-semibold capitalize">
                    {t(`days.${dayIndex}`)}
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {day}
                  </p>
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
      </main>
    </>
  );
}
