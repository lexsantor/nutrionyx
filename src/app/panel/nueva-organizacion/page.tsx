import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import { NewOrganizationForm } from "./new-organization-form";

export const metadata = { title: "Crea tu consulta" };

export const dynamic = "force-dynamic";

/**
 * Where sign-up lands a specialist: `/` -> roleHome -> `/panel` ->
 * requireSpecialistOrg finds no org -> here. That guard cannot be reused
 * (it redirects *to* this page), so the inverse runs inline: no session is
 * sent to sign-in, another role goes to its own area, and a specialist who
 * already has a consulta goes back to it rather than creating a second one
 * the console would never show.
 */
export default async function NewOrganizationPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const role = await resolveUserRole(session.user.id);
  if (role !== "nutritionist") {
    redirect(roleHome(role));
  }

  const { data: organizations } = await auth.organization.list();
  if (organizations && organizations.length > 0) {
    redirect("/panel");
  }

  const t = await getTranslations("org.create");
  const name = session.user.name?.trim();

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-5">
        <p className="rounded-[10px] bg-success-soft px-3 py-2 text-center text-sm text-success">
          {name ? t("accountReadyNamed", { name }) : t("accountReady")}
        </p>

        <div className="flex flex-col gap-2">
          <h1 className="text-center text-2xl font-semibold">{t("title")}</h1>
          <p className="text-center text-sm text-ink-subtle">{t("subtitle")}</p>
        </div>

        <NewOrganizationForm />
      </div>
    </main>
  );
}
