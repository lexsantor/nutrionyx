"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { OrgProfile } from "@/modules/organization/repository";
import { updateProfileAction, type ProfileFormState } from "./actions";

export function ProfileForm({ profile }: { profile: OrgProfile }) {
  const t = useTranslations("settings");
  const [state, formAction, isPending] = useActionState<
    ProfileFormState,
    FormData
  >(updateProfileAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{t("name")}</span>
        <p className="text-base">{profile.name}</p>
        <p className="text-xs text-ink-subtle">{t("nameHint")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field id="legalName" label={t("legalName")} defaultValue={profile.legalName} />
        <Field id="taxId" label={t("taxId")} defaultValue={profile.taxId} />
        <Field id="slug" label={t("slug")} defaultValue={profile.slug} hint={t("slugHint")} />
        <Field id="hours" label={t("hours")} defaultValue={profile.hours} placeholder="L-V 9:00-14:00" />
        <Field id="addressLine" label={t("addressLine")} defaultValue={profile.addressLine} />
        <Field id="locality" label={t("locality")} defaultValue={profile.locality} />
        <Field id="postalCode" label={t("postalCode")} defaultValue={profile.postalCode} />
        <Field id="country" label={t("country")} defaultValue={profile.country ?? "ES"} />
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="logoUrl" className="text-sm font-medium">
            {t("logoUrl")}
          </label>
          <Input
            id="logoUrl"
            name="logoUrl"
            type="url"
            defaultValue={profile.logoUrl ?? ""}
            placeholder="https://..."
            maxLength={500}
          />
          <p className="text-xs text-ink-subtle">{t("logoHint")}</p>
        </div>
        {profile.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logoUrl}
            alt={t("logoPreview")}
            className="h-12 w-auto self-start rounded-md border border-hairline bg-surface-1 object-contain p-1"
          />
        ) : null}
      </Card>

      {state && "errorKey" in state ? (
        <p role="alert" className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error">
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}
      {state && "ok" in state ? (
        <p role="status" className="rounded-[10px] bg-success-soft px-3 py-2 text-sm text-success">
          {t("saved")}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? t("saving") : t("save")}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  defaultValue,
  hint,
  placeholder,
}: {
  id: string;
  label: string;
  defaultValue: string | null;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        name={id}
        type="text"
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        maxLength={200}
      />
      {hint ? <p className="text-xs text-ink-subtle">{hint}</p> : null}
    </div>
  );
}
