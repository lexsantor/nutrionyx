import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { listPatients } from "@/modules/patient/repository";
import { listInbox } from "@/modules/messaging/repository";
import { sameMadridDay } from "@/modules/scheduling/time";

export const metadata = { title: "Mensajes" };
export const dynamic = "force-dynamic";

/**
 * Every thread in one place (docs/build/navigation-audit.md, tier 1).
 * Messaging existed only inside a patient, with unread surfacing as a badge
 * on the patients table, so "who wrote me" meant scanning a caseload.
 *
 * Unread threads sort first: the page answers who is waiting, not what
 * happened most recently.
 */
export default async function InboxPage() {
  const t = await getTranslations("inbox");
  const format = await getFormatter();
  const { org } = await requireSpecialistOrg();

  const [threads, patients] = await Promise.all([
    listInbox(org.id),
    listPatients(org.id),
  ]);
  const nameOf = new Map(patients.map((p) => [p.id, p.fullName ?? p.email]));
  const unreadThreads = threads.filter((thread) => thread.unread > 0).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-base text-ink-subtle">
          {unreadThreads > 0 ? t("waiting", { count: unreadThreads }) : t("subtitle")}
        </p>
      </div>

      {threads.length === 0 ? (
        <p className="rounded-xl border border-hairline bg-surface-1 p-6 text-sm text-ink-subtle">
          {t("empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {threads.map((thread) => (
            <li key={thread.patientId}>
              <Link
                href={`/panel/pacientes/${thread.patientId}/mensajes`}
                className="flex items-start gap-4 rounded-xl border border-hairline bg-surface-1 p-4 no-underline transition-[border-color,background-color] hover:border-hairline-strong hover:bg-surface-2"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span
                      className={
                        thread.unread > 0
                          ? "font-semibold text-ink"
                          : "font-medium text-ink"
                      }
                    >
                      {nameOf.get(thread.patientId) ?? t("unknownPatient")}
                    </span>
                    {thread.unread > 0 ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold tabular-nums text-on-primary">
                        {t("unread", { count: thread.unread })}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex min-w-0 gap-1.5 text-sm text-ink-subtle">
                    <span className="shrink-0">
                      {thread.last.sender === "SPECIALIST"
                        ? t("youPrefix")
                        : null}
                    </span>
                    {/* One line: the inbox is for triage, the thread is for
                        reading. */}
                    <span className="truncate">{thread.last.body}</span>
                  </span>
                </span>
                <time
                  dateTime={thread.last.createdAt.toISOString()}
                  className="shrink-0 text-xs text-ink-subtle"
                >
                  {sameMadridDay(thread.last.createdAt)
                    ? t("today", {
                        time: format.dateTime(thread.last.createdAt, {
                          timeStyle: "short",
                        }),
                      })
                    : format.dateTime(thread.last.createdAt, {
                        dateStyle: "medium",
                      })}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
