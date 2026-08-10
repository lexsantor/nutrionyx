"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { addNoteAction, type NoteFormState } from "./actions";

export function NoteForm({ patientId }: { patientId: string }) {
  const t = useTranslations("notes");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<
    NoteFormState,
    FormData
  >(addNoteAction, null);

  // Clear the textarea after a successful save.
  useEffect(() => {
    if (state && "ok" in state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="patientId" value={patientId} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="note-body" className="sr-only">
          {t("bodyLabel")}
        </label>
        <textarea
          id="note-body"
          name="body"
          required
          maxLength={4000}
          rows={3}
          placeholder={t("placeholder")}
          className="block w-full resize-y rounded-[10px] border border-hairline bg-surface-2 px-3.5 py-2.5 text-base text-ink placeholder:text-ink-tertiary"
        />
      </div>
      <Button
        type="submit"
        variant="secondary"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? t("saving") : t("save")}
      </Button>
      {state && "errorKey" in state ? (
        <p
          role="alert"
          className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
        >
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}
    </form>
  );
}
