"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  sendPatientMessageAction,
  type MessageFormState,
} from "./actions";

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
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <label htmlFor="body" className="sr-only">
          {t("composerLabel")}
        </label>
        <textarea
          id="body"
          name="body"
          required
          maxLength={4000}
          rows={2}
          placeholder={t("composerPlaceholder")}
          className="block w-full flex-1 resize-y rounded-[10px] border border-field-border bg-surface-2 px-3.5 py-2.5 text-base text-ink placeholder:text-ink-subtle"
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? t("sending") : t("send")}
        </Button>
      </div>
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
    </form>
  );
}
