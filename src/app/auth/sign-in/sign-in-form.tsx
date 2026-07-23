"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmail } from "./actions";

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const t = useTranslations("auth.signIn");
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="pointer-events-none absolute -inset-40 bg-[radial-gradient(ellipse_at_center,var(--color-primary-subtle)_0%,transparent_60%)]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight text-ink no-underline">
            Nutrionyx
          </Link>
        </div>

        <div className="rounded-xl border border-hairline bg-surface-1 p-8 shadow-el-sm">
          <h1 className="mb-1 text-center font-display text-xl font-semibold">{t("title")}</h1>
          <p className="mb-8 text-center text-sm text-ink-subtle">Accede a tu panel de profesional</p>

          <form action={formAction} className="flex flex-col gap-5">
            <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-ink">
                {t("password")}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
            </div>

            {state?.errorKey ? (
              <p role="alert" className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error">
                {t(`errors.${state.errorKey}`)}
              </p>
            ) : null}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? t("submitting") : t("submit")}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-subtle">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/sign-up" className="font-medium text-ink underline-offset-2 hover:text-primary">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}