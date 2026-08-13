"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  cancelAppointmentAction,
  confirmAppointmentAction,
  type ConfirmAppointmentState,
  createAppointmentAction,
  type AppointmentFormState,
  type CancelAppointmentState,
} from "./actions";

const DURATIONS = [15, 30, 45, 60, 90];

export function AppointmentForm({
  patients,
}: {
  patients: { id: string; name: string }[];
}) {
  const t = useTranslations("agenda.form");
  const [mode, setMode] = useState<"IN_PERSON" | "VIDEO">("IN_PERSON");
  const [state, formAction, isPending] = useActionState<
    AppointmentFormState,
    FormData
  >(createAppointmentAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="patientId" className="text-sm font-medium">
            {t("patient")}
          </label>
          <Select id="patientId" name="patientId" required>
            <option value="">{t("patientPlaceholder")}</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="date" className="text-sm font-medium">
              {t("date")}
            </label>
            <Input id="date" name="date" type="date" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="time" className="text-sm font-medium">
              {t("time")}
            </label>
            <Input id="time" name="time" type="time" required />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="durationMin" className="text-sm font-medium">
            {t("duration")}
          </label>
          <Select
            id="durationMin"
            name="durationMin"
            defaultValue="60"
            
          >
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {t("durationMin", { min: d })}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mode" className="text-sm font-medium">
            {t("mode")}
          </label>
          <Select
            id="mode"
            name="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as "IN_PERSON" | "VIDEO")}
                      >
            <option value="IN_PERSON">{t("modes.IN_PERSON")}</option>
            <option value="VIDEO">{t("modes.VIDEO")}</option>
          </Select>
        </div>
        {mode === "VIDEO" ? (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="videoUrl" className="text-sm font-medium">
              {t("videoUrl")}
            </label>
            <Input
              id="videoUrl"
              name="videoUrl"
              type="url"
              placeholder="https://meet.google.com/…"
              maxLength={500}
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="note" className="text-sm font-medium">
            {t("note")}
          </label>
          <Input
            id="note"
            name="note"
            type="text"
            maxLength={500}
            placeholder={t("notePlaceholder")}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="self-start">
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
      <div role="status">
        {state && "ok" in state ? (
          <p
          className="rounded-[10px] bg-success-soft px-3 py-2 text-sm text-success"
        >
          {t("saved")}
        </p>
        ) : null}
        </div>
    </form>
  );
}

export function CancelButton({ appointmentId }: { appointmentId: string }) {
  const t = useTranslations("agenda");
  const [state, formAction, isPending] = useActionState<
    CancelAppointmentState,
    FormData
  >(cancelAppointmentAction, null);
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="inline-flex h-8 items-center rounded-full px-3 text-sm text-ink-subtle transition-[transform,background-color,color] hover:bg-error-soft hover:text-error active:scale-[0.98] active:duration-150"
      >
        {t("cancel")}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      {state?.errorKey ? (
        <span role="alert" className="text-xs text-error">
          {t("cancelError")}
        </span>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-8 items-center rounded-full bg-error px-3 text-sm font-semibold text-on-destructive transition-[transform,background-color] hover:bg-error-hover active:scale-[0.97] active:duration-150 disabled:opacity-60"
      >
        {t("confirmCancel")}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="inline-flex h-8 items-center rounded-full px-2 text-sm text-ink-subtle transition-colors hover:text-ink"
      >
        {t("keep")}
      </button>
    </form>
  );
}

/**
 * Accepts a patient's request. No arming step, unlike cancelling: confirming
 * is the safe direction, and making the specialist tap twice for the answer
 * they give most of the time is friction for nothing.
 */
export function ConfirmButton({ appointmentId }: { appointmentId: string }) {
  const t = useTranslations("agenda.requests");
  const [, formAction, isPending] = useActionState<
    ConfirmAppointmentState,
    FormData
  >(confirmAppointmentAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-8 items-center rounded-full bg-primary px-3 text-sm font-semibold text-on-primary transition-[transform,background-color] hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60"
      >
        {t("confirm")}
      </button>
    </form>
  );
}
