"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requestAppointmentAction, type RequestState } from "./actions";

/**
 * The patient asks for a slot. A request and not a booking (owner decision,
 * slice-31): the specialist confirms it before it enters their day, because
 * a slot that depends on whether the previous review runs long is theirs to
 * give, and cancelling a cita the app itself handed out is worse than asking.
 *
 * Collapsed by default. The home is a place a patient checks in thirty
 * seconds, and an open form on it would compete with the day's checklist.
 */
export function RequestAppointment() {
  const t = useTranslations("agenda.request");
  const tf = useTranslations("agenda.form");
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<RequestState, FormData>(
    requestAppointmentAction,
    null,
  );

  if (state && "ok" in state) {
    return (
      <p role="status" className="text-sm text-success">
        {t("sent")}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit text-sm text-accent-text"
      >
        {t("open")}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-sm text-ink-subtle">{t("hint")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="req-date" className="text-sm font-medium">
            {tf("date")}
          </label>
          <Input id="req-date" name="date" type="date" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="req-time" className="text-sm font-medium">
            {tf("time")}
          </label>
          <Input id="req-time" name="time" type="time" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="req-mode" className="text-sm font-medium">
            {tf("mode")}
          </label>
          <Select id="req-mode" name="mode" defaultValue="IN_PERSON">
            <option value="IN_PERSON">{tf("modes.IN_PERSON")}</option>
            <option value="VIDEO">{tf("modes.VIDEO")}</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="req-note" className="text-sm font-medium">
            {tf("note")}
          </label>
          <Input id="req-note" name="note" type="text" maxLength={200} />
        </div>
      </div>
      {state && "errorKey" in state ? (
        <p role="alert" className="text-sm text-error">
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
