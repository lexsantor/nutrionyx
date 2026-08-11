import { getTranslations } from "next-intl/server";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import {
  getOrgProfile,
} from "@/modules/organization/repository";
import {
  CURRENT_DPA_VERSION,
  hasAcceptedConsent,
} from "@/modules/organization/consent";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import { SpecialtySettings } from "./specialty-settings";
import { acceptConsentAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { org } = await requireSpecialistOrg();
  const [profile, consentAccepted] = await Promise.all([
    getOrgProfile(org.id),
    hasAcceptedConsent(org.id, "DPA", CURRENT_DPA_VERSION),
  ]);

  const t = await getTranslations("settings");

  return (
    <>
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
                  className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-on-primary transition-[transform,box-shadow,border-color,background-color,color] duration-200 hover:bg-primary-hover active:scale-[0.97]"
                >
                  {t("consent.accept")}
                </button>
              </form>
            </div>
          </Card>
        ) : (
          <p className="inline-flex items-center gap-1.5 text-sm text-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {t("consent.accepted")}
          </p>
        )}

        {profile ? <ProfileForm profile={profile} /> : null}
      </div>
    </>
  );
}
