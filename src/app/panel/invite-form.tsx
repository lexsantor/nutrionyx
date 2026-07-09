"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { invitePatient, type InviteFormState } from "./actions";

export function InviteForm() {
  const t = useTranslations("panel.invite");
  const [state, formAction, isPending] = useActionState<
    InviteFormState,
    FormData
  >(invitePatient, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4">
      <h3 className="font-semibold">{t("title")}</h3>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="fullName" className="text-sm font-medium">
            {t("name")}
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="block w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="block w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>
      </div>

      {state && "errorKey" in state ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}
      {state && "ok" in state ? (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {t("sent")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
