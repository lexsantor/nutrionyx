"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bezel } from "@/components/ui/bezel";
import { signUpWithEmail } from "./actions";

export function SignUpForm({ redirectTo }: { redirectTo?: string }) {
  const t = useTranslations("auth.signUp");
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

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
          <h1 className="mb-1 text-center font-display text-xl font-semibold">{t("title")}</h1>
          <p className="mb-8 text-center text-sm text-ink-subtle">Crea tu cuenta de profesional</p>

          <form action={formAction} className="flex flex-col gap-5">
            <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-ink">
                {t("name")}
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="María García"
              />
            </div>

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
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
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

            <p className="text-center text-xs text-ink-subtle">
              {t.rich("legal", {
                terms: (chunks) => (
                  <Link href="/terminos" className="font-medium text-ink">
                    {chunks}
                  </Link>
                ),
                privacy: (chunks) => (
                  <Link href="/privacidad" className="font-medium text-ink">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </form>
        </Bezel>

        <p className="mt-6 text-center text-sm text-ink-subtle">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/sign-in" className="font-medium text-ink transition-colors hover:text-primary">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}