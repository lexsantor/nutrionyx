"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ComposerShell } from "@/components/composer-shell";
import { sendPatientMessageAction, type MessageFormState } from "./actions";

export function Composer() {
  const t = useTranslations("messages");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<
    MessageFormState,
    FormData
  >(sendPatientMessageAction, null);

  useEffect(() => {
    if (state && "ok" in state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <ComposerShell
        name="body"
        label={t("composerLabel")}
        placeholder={t("composerPlaceholder")}
        maxLength={4000}
        defaultValue={state && "errorKey" in state ? (state.body ?? "") : ""}
        pending={isPending}
        sendLabel={t("send")}
        sendingLabel={t("sending")}
        hint={t("composerHintPatient")}
      >
        {state && "errorKey" in state ? (
          <p
            role="alert"
            className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
          >
            {t(`errors.${state.errorKey}`)}
          </p>
        ) : null}
        <p role="status" className="sr-only">
          {state && "ok" in state ? t("sent") : ""}
        </p>
      </ComposerShell>
    </form>
  );
}
