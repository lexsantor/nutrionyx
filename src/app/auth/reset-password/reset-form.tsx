"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bezel } from "@/components/ui/bezel";
import { resetPassword } from "./actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("auth.reset");
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-x-clip px-6">
      <div className="pointer-events-none absolute -inset-40 bg-[radial-gradient(ellipse_at_center,var(--color-primary-subtle)_0%,transparent_60%)]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight text-ink no-underline">
            Nutrionyx
          </Link>
        </div>

        <Bezel radius="1.25rem" innerClassName="p-8">
          <h1 className="mb-1 text-center font-display text-xl font-semibold">
            {t("title")}
          </h1>
          <p className="mb-8 text-center text-sm text-ink-subtle">
            {t("subtitle")}
          </p>

          {token ? (
            <form action={formAction} className="flex flex-col gap-5">
              <input type="hidden" name="token" value={token} />

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-ink"
                >
                  {t("password")}
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                />
                <p className="text-xs text-ink-subtle">{t("hint")}</p>
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
          ) : (
            <p
              role="alert"
              className="rounded-[10px] bg-surface-3 px-3 py-2 text-sm text-ink-muted"
            >
              {t("missingToken")}
            </p>
          )}
        </Bezel>

        <p className="mt-6 text-center text-sm text-ink-subtle">
          <Link
            href="/auth/forgot-password"
            className="font-medium text-ink transition-colors hover:text-primary"
          >
            {t("requestAgain")}
          </Link>
        </p>
      </div>
    </main>
  );
}
