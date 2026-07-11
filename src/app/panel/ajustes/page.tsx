import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import {
  ensureOrganization,
  getOrgProfile,
} from "@/modules/organization/repository";
import { ConsoleShell } from "@/components/console-shell";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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
  const profile = await getOrgProfile(org.id);

  const t = await getTranslations("settings");

  return (
    <ConsoleShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-base text-ink-subtle">{t("subtitle")}</p>
        </div>
        {profile ? <ProfileForm profile={profile} /> : null}
      </div>
    </ConsoleShell>
  );
}
