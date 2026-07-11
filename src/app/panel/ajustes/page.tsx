import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import {
  ensureOrganization,
  getOrgProfile,
} from "@/modules/organization/repository";
import {
  CURRENT_DPA_VERSION,
  hasAcceptedConsent,
} from "@/modules/organization/consent";
import { ConsoleShell } from "@/components/console-shell";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import { SpecialtySettings } from "./specialty-settings";
import { acceptConsentAction } from "./actions";

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
  const consentAccepted = await hasAcceptedConsent(
    org.id,
    "DPA",
    CURRENT_DPA_VERSION,
  );

  const t = await getTranslations("settings");

  return (
    <ConsoleShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-base text-ink-subtle">{t("subtitle")}</p>
        </div>

        <Card>
          <SpecialtySettings current={profile?.specialtyType ?? null} />
        </Card>

        {!consentAccepted ? (
          <Card>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">
                  {t("consent.title")}
                </h2>
                <p className="text-sm text-ink-subtle">{t("consent.hint")}</p>
              </div>
              <form action={acceptConsentAction}>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover"
                >
                  {t("consent.accept")}
                </button>
              </form>
            </div>
          </Card>
        ) : (
          <p className="text-xs text-ink-subtle">{t("consent.accepted")}</p>
        )}

        {profile ? <ProfileForm profile={profile} /> : null}
      </div>
    </ConsoleShell>
  );
}
