import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { ensureOrganization } from "@/modules/organization/repository";
import { listPatients } from "@/modules/patient/repository";
import { InviteForm } from "./invite-form";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const t = await getTranslations("panel");
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { data: organizations } = await auth.organization.list();

  if (!organizations || organizations.length === 0) {
    redirect("/panel/nueva-organizacion");
  }

  const active = organizations[0];
  // Idempotent self-repair: the domain mirror always matches the auth org.
  const org = await ensureOrganization(active.id, active.name);
  const patients = await listPatients(org.id);

  const { data: pending } = await auth.organization.listInvitations({
    query: { organizationId: active.id },
  });
  const pendingInvitations = (pending ?? []).filter(
    (invitation) => invitation.status === "pending",
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="flex items-baseline justify-between border-b border-zinc-200 pb-4">
        <h1 className="text-xl font-bold">{active.name}</h1>
        <span className="text-sm text-zinc-600">{session.user.name}</span>
      </header>

      <section className="flex flex-col gap-6 py-8">
        <h2 className="text-lg font-semibold">{t("patients.title")}</h2>

        {patients.length === 0 ? (
          <p className="text-sm text-zinc-600">{t("patients.empty")}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-600">
                <th scope="col" className="py-2 pr-4 font-medium">
                  {t("patients.name")}
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  {t("patients.email")}
                </th>
                <th scope="col" className="py-2 font-medium">
                  {t("patients.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-zinc-100">
                  <td className="py-2 pr-4">{patient.fullName}</td>
                  <td className="py-2 pr-4">{patient.email}</td>
                  <td className="py-2">
                    <span
                      className={
                        patient.status === "ACTIVE"
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                          : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                      }
                    >
                      {t(`patients.statuses.${patient.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <InviteForm />

        {pendingInvitations.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">{t("invitations.title")}</h3>
            <p className="text-xs text-zinc-500">{t("invitations.hint")}</p>
            <ul className="flex flex-col gap-1 text-sm">
              {pendingInvitations.map((invitation) => (
                <li key={invitation.id} className="flex flex-wrap items-center gap-2">
                  <span>{invitation.email}</span>
                  <code className="rounded bg-zinc-100 px-2 py-0.5 text-xs">
                    /auth/accept-invitation?invitationId={invitation.id}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </main>
  );
}
