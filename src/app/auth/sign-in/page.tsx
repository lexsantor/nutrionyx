"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signInWithEmail } from "./actions";

export default function SignInPage() {
  const t = useTranslations("auth.signIn");
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form action={formAction} className="flex w-full max-w-sm flex-col gap-5">
        <h1 className="text-center text-2xl font-bold">{t("title")}</h1>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            {t("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="block w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        {state?.errorKey ? (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {t(`errors.${state.errorKey}`)}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {isPending ? t("submitting") : t("submit")}
        </button>
      </form>
    </main>
  );
}
