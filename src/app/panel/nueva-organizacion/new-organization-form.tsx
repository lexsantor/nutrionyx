"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrganization } from "./actions";

const SPECIALTIES = [
  { value: "DIETITIAN", key: "dietitian" },
  { value: "SPORTS_NUTRITIONIST", key: "sports" },
] as const;

export function NewOrganizationForm() {
  const t = useTranslations("org.create");
  const [state, formAction, isPending] = useActionState(
    createOrganization,
    null,
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          {t("name")}
        </label>
        <Input id="name" name="name" type="text" required maxLength={80} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">
          {t("specialty.legend")}
        </legend>
        {SPECIALTIES.map((s, i) => (
          <label
            key={s.value}
            className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-hairline p-3 transition-colors hover:border-hairline-strong has-[:checked]:border-primary has-[:checked]:bg-primary-subtle"
          >
            <input
              type="radio"
              name="specialtyType"
              value={s.value}
              defaultChecked={i === 0}
              className="mt-1"
            />
            <span className="flex flex-col">
              <span className="text-sm font-medium text-ink">
                {t(`specialty.${s.key}.label`)}
              </span>
              <span className="text-xs text-ink-subtle">
                {t(`specialty.${s.key}.hint`)}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="accessCode" className="text-sm font-medium">
          {t("code")}
        </label>
        <Input
          id="accessCode"
          name="accessCode"
          type="text"
          required
          autoComplete="off"
          maxLength={64}
        />
        <p className="text-xs text-ink-subtle">
          {t.rich("codeHint", {
            contact: (chunks) => (
              <a href="mailto:lexsantor@gmail.com" className="font-medium text-ink">
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" className="mt-1" required />
        <span className="text-ink-subtle">{t("consent.label")}</span>
      </label>

      {state?.errorKey ? (
        <p
          role="alert"
          className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
        >
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
