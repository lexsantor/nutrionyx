"use client";

import { useActionState, useState } from "react";
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
  // Same pair as the week editors: echo the values back, and remount so
  // `defaultValue` is read again, since it is only consulted on mount.
  const [generation, setGeneration] = useState(0);
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    setGeneration((n) => n + 1);
  }
  const echoed = state && "errorKey" in state ? state.values : undefined;
  const v = (name: string, fallback: string | null) =>
    echoed?.[name] ?? fallback ?? "";

  return (
    <form key={generation} action={formAction} className="flex w-full flex-col gap-6">
      {/* One grid for the whole record: rows of two and three left the
          card two thirds empty on a desktop. The longer values span. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          id="name"
          label={t("name")}
          defaultValue={v("name", profile.name)}
          required
          hint={t("nameHint")}
          className="lg:col-span-2"
        />
        <Field id="slug" label={t("slug")} defaultValue={v("slug", profile.slug)} hint={t("slugHint")} />

        <Field id="legalName" label={t("legalName")} defaultValue={v("legalName", profile.legalName)} />
        <Field id="taxId" label={t("taxId")} defaultValue={v("taxId", profile.taxId)} />
        <Field id="hours" label={t("hours")} defaultValue={v("hours", profile.hours)} placeholder="L-V 9:00-14:00" />

        <Field
          id="addressLine"
          label={t("addressLine")}
          defaultValue={v("addressLine", profile.addressLine)}
          autoComplete="street-address"
          className="lg:col-span-2"
        />
        <Field id="locality" label={t("locality")} defaultValue={v("locality", profile.locality)} autoComplete="address-level2" />

        <Field id="postalCode" label={t("postalCode")} defaultValue={v("postalCode", profile.postalCode)} autoComplete="postal-code" />
        <Field id="country" label={t("country")} defaultValue={profile.country ?? "ES"} autoComplete="country-name" />
      </div>

      <Card className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span id="logo-label" className="text-sm font-medium">
            {t("logoFile")}
          </span>
          <LogoFileInput chooseLabel={t("logoChoose")} emptyLabel={t("logoNoFile")} />
          <p className="text-sm text-ink-subtle">{t("logoFileHint")}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="logoUrl" className="text-sm font-medium">
            {t("logoUrl")}
          </label>
          <Input
            id="logoUrl"
            name="logoUrl"
            type="url"
            defaultValue={v("logoUrl", profile.logoUrl)}
            placeholder="https://..."
            maxLength={500}
          />
          <p className="text-sm text-ink-subtle">{t("logoHint")}</p>
        </div>
        </div>
        {profile.logoUrl ? (
          <figure className="flex flex-col items-center gap-1.5 sm:w-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.logoUrl}
              alt=""
              width={320}
              height={160}
              className="h-20 w-full rounded-[10px] border border-hairline bg-surface-1 object-contain p-2"
            />
            <figcaption className="text-xs text-ink-subtle">
              {t("logoPreview")}
            </figcaption>
          </figure>
        ) : null}
      </Card>

      {state && "errorKey" in state ? (
        <p role="alert" className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error">
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}
      <div role="status">
        {state && "ok" in state ? (
          <p className="rounded-[10px] bg-success-soft px-3 py-2 text-sm text-success">
            {t("saved")}
          </p>
        ) : null}
      </div>

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
  required,
  autoComplete,
  className = "",
}: {
  id: string;
  label: string;
  defaultValue: string | null;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  /** Grid placement from the caller; the field owns nothing else. */
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        name={id}
        type="text"
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        maxLength={200}
      />
      {hint ? <p className="text-sm text-ink-subtle">{hint}</p> : null}
    </div>
  );
}

/**
 * The browser's file input renders its own button, with its own words, in
 * the browser's language: "Choose File" appears on a Spanish page and no
 * CSS or attribute reaches the text. The input keeps working and keeps its
 * semantics; it is visually hidden behind a label that acts as the button,
 * which is the one native control on this page that can be replaced
 * without taking on a widget.
 */
function LogoFileInput({
  chooseLabel,
  emptyLabel,
}: {
  chooseLabel: string;
  emptyLabel: string;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-field-border bg-surface-2 p-1.5">
      <label
        htmlFor="logo"
        className="inline-flex h-8 shrink-0 cursor-pointer items-center rounded-full bg-surface-3 px-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-4"
      >
        {chooseLabel}
      </label>
      <input
        id="logo"
        name="logo"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-labelledby="logo-label"
        onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
        className="sr-only"
      />
      <span className="min-w-0 truncate text-sm text-ink-subtle">
        {fileName ?? emptyLabel}
      </span>
    </div>
  );
}
