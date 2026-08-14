import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { LockedFieldset, LockedNotice } from "@/components/ui/locked-section";

export const metadata = { title: "Facturación" };
export const dynamic = "force-dynamic";

/**
 * The patient's half of billing, built and switched off alongside the
 * specialist's (owner request, 2026-08-14).
 *
 * The wording matters more here than on the console side. A patient who finds
 * a billing section can reasonably conclude they are about to be charged
 * through the platform, so the notice says plainly that nothing is charged
 * here and that payment is arranged with their consulta as it was before.
 */
export default async function PatientBillingPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) redirect("/");

  const t = await getTranslations("billing.patient");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-base text-ink-subtle">{t("subtitle")}</p>
      </div>

      <LockedNotice title={t("locked.title")}>
        <p>{t("locked.body")}</p>
      </LockedNotice>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{t("invoices.title")}</h2>
            <p className="text-sm text-ink-subtle">{t("invoices.hint")}</p>
          </div>
          {/* Empty state rather than sample invoices: a receipt-shaped row a
              patient could mistake for a real charge is exactly the thing not
              to render. */}
          <p className="rounded-[10px] border border-dashed border-hairline-strong px-4 py-6 text-center text-sm text-ink-subtle">
            {t("invoices.empty")}
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{t("method.title")}</h2>
            <p className="text-sm text-ink-subtle">{t("method.hint")}</p>
          </div>
          <LockedFieldset legend={t("method.title")}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="holder" className="text-sm font-medium">
                {t("method.holder")}
              </label>
              <Input id="holder" name="holder" type="text" autoComplete="off" />
            </div>
            <Button variant="secondary" className="self-start">
              {t("method.add")}
            </Button>
          </LockedFieldset>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{t("questions.title")}</h2>
          <p className="text-sm text-ink-subtle">{t("questions.hint")}</p>
          <ButtonLink
            href="/mi-espacio/mensajes"
            variant="secondary"
            className="self-start"
          >
            {t("questions.action")}
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
