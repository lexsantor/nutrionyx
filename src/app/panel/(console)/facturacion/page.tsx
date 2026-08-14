import { getTranslations } from "next-intl/server";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { getOrgProfile } from "@/modules/organization/repository";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { LockedFieldset, LockedNotice } from "@/components/ui/locked-section";

export const metadata = { title: "Facturación" };
export const dynamic = "force-dynamic";

/**
 * Billing, built and switched off (owner request, 2026-08-14).
 *
 * Nothing here writes, and there is no invoice model behind it on purpose:
 * the AEAT requires an unalterable invoice and the Verifactu study that says
 * what that costs has not happened, so committing to a schema now would be
 * committing to the wrong one. What this page does is show the shape of the
 * section and the two things that block it.
 *
 * No sample invoices. A page that renders plausible invoice rows is a
 * fabricated record even behind a disabled banner, so the list is an honest
 * empty state.
 */
export default async function BillingPage() {
  const { org } = await requireSpecialistOrg();
  const profile = await getOrgProfile(org.id);
  const t = await getTranslations("billing.specialist");

  // The fiscal identity an invoice would carry. Real values, read from the
  // consulta profile - and the placeholders are called out rather than shown
  // as if they were settled.
  const fiscal = [
    { key: "legalName", value: profile?.legalName ?? null },
    { key: "taxId", value: profile?.taxId ?? null },
    { key: "addressLine", value: profile?.addressLine ?? null },
    { key: "locality", value: profile?.locality ?? null },
    { key: "postalCode", value: profile?.postalCode ?? null },
  ] as const;
  const placeholderTaxId = profile?.taxId === "B00000000";
  const missing = fiscal.filter((f) => !f.value).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-base text-ink-subtle">{t("subtitle")}</p>
      </div>

      <LockedNotice title={t("locked.title")}>
        <p>{t("locked.verifactu")}</p>
        <p className="mt-1.5">{t("locked.meanwhile")}</p>
      </LockedNotice>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{t("fiscal.title")}</h2>
            <p className="text-sm text-ink-subtle">{t("fiscal.hint")}</p>
          </div>

          <dl className="rounded-[10px] border border-hairline">
            {fiscal.map((field) => (
              <div
                key={field.key}
                className="flex justify-between gap-4 border-b border-hairline px-4 py-2.5 last:border-0 even:bg-surface-2/50"
              >
                <dt className="text-sm text-ink-subtle">
                  {t(`fiscal.fields.${field.key}`)}
                </dt>
                <dd
                  className={`text-right text-sm ${
                    field.value ? "font-medium" : "text-ink-subtle"
                  }`}
                >
                  {field.value ?? t("fiscal.unset")}
                </dd>
              </div>
            ))}
          </dl>

          {placeholderTaxId || missing > 0 ? (
            <p className="rounded-[10px] bg-warning-soft px-3 py-2 text-sm text-warning">
              {placeholderTaxId ? t("fiscal.placeholder") : t("fiscal.missing")}
            </p>
          ) : null}

          <ButtonLink
            href="/panel/ajustes"
            variant="secondary"
            className="self-start"
          >
            {t("fiscal.edit")}
          </ButtonLink>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{t("rates.title")}</h2>
            <p className="text-sm text-ink-subtle">{t("rates.hint")}</p>
          </div>

          <LockedFieldset legend={t("rates.title")}>
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="concept" className="text-sm font-medium">
                  {t("rates.concept")}
                </label>
                <Input id="concept" name="concept" type="text" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="amount" className="text-sm font-medium">
                  {t("rates.amount")}
                </label>
                <Input
                  id="amount"
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="45,00"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="vat" className="text-sm font-medium">
                  {t("rates.vat")}
                </label>
                <Input
                  id="vat"
                  name="vat"
                  type="text"
                  inputMode="numeric"
                  placeholder="21"
                />
              </div>
            </div>
            <Button variant="secondary" className="self-start">
              {t("rates.add")}
            </Button>
          </LockedFieldset>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{t("invoices.title")}</h2>
            <p className="text-sm text-ink-subtle">{t("invoices.hint")}</p>
          </div>
          {/* An empty state, not example rows: an invoice-shaped row that no
              invoice stands behind is a fabricated record. */}
          <p className="rounded-[10px] border border-dashed border-hairline-strong px-4 py-6 text-center text-sm text-ink-subtle">
            {t("invoices.empty")}
          </p>
          <LockedFieldset legend={t("invoices.title")}>
            <Button className="self-start">{t("invoices.issue")}</Button>
          </LockedFieldset>
        </div>
      </Card>
    </div>
  );
}
