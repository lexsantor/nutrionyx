"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrganization } from "./actions";

export default function NewOrganizationPage() {
  const t = useTranslations("org.create");
  const [state, formAction, isPending] = useActionState(
    createOrganization,
    null,
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form action={formAction} className="flex w-full max-w-sm flex-col gap-5">
        <h1 className="text-center text-2xl font-semibold">{t("title")}</h1>
        <p className="text-center text-sm text-ink-subtle">{t("subtitle")}</p>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            {t("name")}
          </label>
          <Input id="name" name="name" type="text" required maxLength={80} />
        </div>

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
          <p className="text-xs text-ink-subtle">{t("codeHint")}</p>
        </div>

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
    </main>
  );
}
