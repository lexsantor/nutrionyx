"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpWithEmail } from "./actions";

export function SignUpForm({ redirectTo }: { redirectTo?: string }) {
  const t = useTranslations("auth.signUp");
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form action={formAction} className="flex w-full max-w-sm flex-col gap-5">
        <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
        <h1 className="text-center text-2xl font-semibold">{t("title")}</h1>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            {t("name")}
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            {t("email")}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            {t("password")}
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
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
