import { getTranslations, getFormatter } from "next-intl/server";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { listPatients } from "@/modules/patient/repository";
import {
  listRequests,
  listUpcomingByOrg,
} from "@/modules/scheduling/repository";
import { Card } from "@/components/ui/card";
import {
  AppointmentForm,
  CancelButton,
  ConfirmButton,
} from "./appointment-form";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const t = await getTranslations("agenda");
  const tr = await getTranslations("agenda.requests");
  const format = await getFormatter();

  const { org } = await requireSpecialistOrg();

  const [patients, upcoming, requests] = await Promise.all([
    listPatients(org.id),
    listUpcomingByOrg(org.id, new Date()),
    listRequests(org.id, new Date()),
  ]);

  // Group by Madrid calendar day for display.
  const groups = new Map<string, typeof upcoming>();
  for (const item of upcoming) {
    const key = format.dateTime(item.startsAt, { dateStyle: "full" });
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>

        {/* Requests first: they are the only thing here that is waiting on
            the specialist, and a decision buried under a form gets made late. */}
        {requests.length > 0 ? (
          <Card>
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">{tr("title")}</h2>
              <ul className="flex flex-col">
                {requests.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-hairline py-3 last:border-0"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {item.patient.fullName ?? item.patient.email}
                      </span>
                      <span className="text-sm text-ink-subtle">
                        {format.dateTime(item.startsAt, {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                        {" · "}
                        {t(`modes.${item.mode}`)}
                        {item.note ? ` · ${item.note}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ConfirmButton appointmentId={item.id} />
                      <CancelButton appointmentId={item.id} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ) : null}

        <Card>
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">{t("newTitle")}</h2>
            <AppointmentForm
              patients={patients.map((p) => ({
                id: p.id,
                name: p.fullName ?? p.email,
              }))}
            />
          </div>
        </Card>

        {upcoming.length === 0 ? (
          <Card>
            <div className="flex flex-col items-start gap-2 py-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-subtle"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <p className="text-sm text-ink-subtle">{t("empty")}</p>
              <p className="text-xs text-ink-subtle">{t("emptyHint")}</p>
            </div>
          </Card>
        ) : (
          [...groups.entries()].map(([day, items]) => (
            <Card key={day}>
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-semibold first-letter:uppercase">
                  {day}
                </h2>
                <ul className="flex flex-col">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-hairline py-2.5 last:border-0"
                    >
                      <span className="text-sm font-semibold tabular-nums">
                        {format.dateTime(item.startsAt, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {item.patient.fullName ?? item.patient.email}
                      </span>
                      <span className="text-xs text-ink-subtle">
                        {t(`modes.${item.mode}`)} ·{" "}
                        {t("durationMin", { min: item.durationMin })}
                        {item.note ? ` · ${item.note}` : ""}
                      </span>
                      <CancelButton appointmentId={item.id} />
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
