"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bezel } from "@/components/ui/bezel";
import { requestPasswordReset } from "./actions";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgot");
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    null,
  );

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

          {state?.ok ? (
            <p
              role="status"
              className="rounded-[10px] bg-success-soft px-3 py-2 text-sm text-success"
            >
              {t("sent")}
            </p>
          ) : (
            <form action={formAction} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-ink">
                  {t("email")}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tu@email.com"
                />
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? t("submitting") : t("submit")}
              </Button>
            </form>
          )}
        </Bezel>

        <p className="mt-6 text-center text-sm text-ink-subtle">
          <Link
            href="/auth/sign-in"
            className="font-medium text-ink transition-colors hover:text-primary"
          >
            {t("backToSignIn")}
          </Link>
        </p>
      </div>
    </main>
  );
}
