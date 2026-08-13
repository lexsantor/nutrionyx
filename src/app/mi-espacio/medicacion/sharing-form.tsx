"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { setSharingAction, type SharingState } from "./actions";

/**
 * The patient decides whether their specialist sees this section at all
 * (owner decision 2026-08-13). Off by default for a new plan; plans that
 * existed before the toggle did are on, because the consulta already held
 * that history.
 *
 * A submit button rather than an onChange switch: turning this off removes a
 * specialist's access to clinical information, which is not something to do
 * on a stray tap, and it keeps working without client JS.
 */
export function SharingForm({ shared }: { shared: boolean }) {
  const t = useTranslations("medication.sharing");
  const [state, formAction, isPending] = useActionState<SharingState, FormData>(
    setSharingAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="shared" value={shared ? "off" : "on"} />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">
          {shared ? t("onTitle") : t("offTitle")}
        </p>
        <p className="text-sm text-ink-subtle">
          {shared ? t("onText") : t("offText")}
        </p>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className={`inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors disabled:opacity-60 sm:w-auto ${
          shared
            ? "border border-hairline bg-surface-1 text-ink hover:border-hairline-strong"
            : "bg-primary text-on-primary hover:bg-primary-hover"
        }`}
      >
        {isPending ? t("saving") : shared ? t("stop") : t("start")}
      </button>
      {state && "errorKey" in state ? (
        <p role="alert" className="text-sm text-error">
          {t(state.errorKey)}
        </p>
      ) : null}
    </form>
  );
}
