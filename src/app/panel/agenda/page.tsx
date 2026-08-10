import { getTranslations, getFormatter } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { listPatients } from "@/modules/patient/repository";
import { listUpcomingByOrg } from "@/modules/scheduling/repository";
import { ConsoleShell } from "@/components/console-shell";
import { Card } from "@/components/ui/card";
import { AppointmentForm, CancelButton } from "./appointment-form";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const t = await getTranslations("agenda");
  const format = await getFormatter();

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

  const [patients, upcoming] = await Promise.all([
    listPatients(org.id),
    listUpcomingByOrg(org.id, new Date()),
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
    <ConsoleShell>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>

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
            <p className="text-sm text-ink-subtle">{t("empty")}</p>
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
    </ConsoleShell>
  );
}
