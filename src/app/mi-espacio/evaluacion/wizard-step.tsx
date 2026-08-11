"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ACTIVITY_LEVELS,
  GOAL_IDS,
  SEXES,
} from "@/modules/assessment/definition";
import { Button } from "@/components/ui/button";
import { submitAnswer, type WizardFormState } from "./actions";
import { GuardrailBanner } from "./guardrail-banner";

type StepProps = {
  field: string;
  kind: "single" | "multi" | "number" | "date" | "text";
  required: boolean;
  stepIndex: number;
  totalSteps: number;
  initialValue: string | string[] | null;
  /** Current weight, only provided for the targetWeightKg step. */
  currentWeightKg?: number;
};

const inputClass =
  "block w-full rounded-[10px] border border-field-border bg-surface-2 px-3.5 py-2.5 text-base text-ink placeholder:text-ink-subtle";

const optionClass =
  "flex cursor-pointer items-center gap-3 rounded-[10px] border border-hairline px-4 py-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-subtle";

const MONTH_KEYS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
] as const;

/**
 * Date of birth as three styled native selects (day / month / year) that
 * compose the same YYYY-MM-DD `value` the server action already expects.
 * A calendar widget is the wrong tool for a birth date decades back.
 */
function DateOfBirthField({ initialValue }: { initialValue: string }) {
  const t = useTranslations("wizard");
  const [y, m, d] = initialValue ? initialValue.split("-") : ["", "", ""];
  const [day, setDay] = useState(d ? String(Number(d)) : "");
  const [month, setMonth] = useState(m ? String(Number(m)) : "");
  const [year, setYear] = useState(y ?? "");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 89 }, (_, i) =>
    String(currentYear - 12 - i),
  );
  // Feb 31 must not compose: cap days at the selected month's length (leap
  // default when the year is not chosen yet) and drop a now-invalid day.
  const maxDay = month
    ? new Date(Number(year || "2000"), Number(month), 0).getDate()
    : 31;
  const safeDay = day && Number(day) <= maxDay ? day : "";
  const value =
    safeDay && month && year
      ? `${year}-${month.padStart(2, "0")}-${safeDay.padStart(2, "0")}`
      : "";

  const selectClass =
    "h-12 w-full appearance-none rounded-[10px] border border-field-border bg-surface-2 py-0 pl-3.5 pr-9 text-base text-ink transition-colors focus:border-primary bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235c7386%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_0.65rem_center]";

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">{t("fields.birthDate.title")}</legend>
      <input type="hidden" name="value" value={value} />
      <div className="grid grid-cols-[1fr_1.4fr_1.1fr] gap-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-subtle">
            {t("dob.day")}
          </span>
          <select
            required
            value={safeDay}
            onChange={(e) => setDay(e.target.value)}
            className={selectClass}
          >
            <option value="" disabled>
              {t("dob.select")}
            </option>
            {Array.from({ length: maxDay }, (_, i) => String(i + 1)).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-subtle">
            {t("dob.month")}
          </span>
          <select
            required
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={selectClass}
          >
            <option value="" disabled>
              {t("dob.select")}
            </option>
            {MONTH_KEYS.map((v) => (
              <option key={v} value={v}>
                {t(`dob.months.${v}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-subtle">
            {t("dob.year")}
          </span>
          <select
            required
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={selectClass}
          >
            <option value="" disabled>
              {t("dob.select")}
            </option>
            {years.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}

export function WizardStep(props: StepProps) {
  const t = useTranslations("wizard");
  const [state, formAction, isPending] = useActionState<
    WizardFormState,
    FormData
  >(submitAnswer, null);
  const [numberValue, setNumberValue] = useState(
    typeof props.initialValue === "string" ? props.initialValue : "",
  );
  // Each step is a fresh mount (server redirect): move focus to the new
  // question so keyboard and SR users don't restart from <body>.
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const singleOptions =
    props.field === "sex"
      ? SEXES
      : props.field === "activityLevel"
        ? ACTIVITY_LEVELS
        : [];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink-subtle">
            {t("progress", { step: props.stepIndex + 1, total: props.totalSteps })}
          </p>
          <Link
            href="/mi-espacio"
            className="inline-flex h-8 items-center rounded-full px-3 text-sm text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink"
          >
            {t("exit")}
          </Link>
        </div>
        <div
          role="progressbar"
          aria-label={t("progress", { step: props.stepIndex + 1, total: props.totalSteps })}
          aria-valuenow={props.stepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={props.totalSteps}
          className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3"
        >
          <div
            className="h-full w-full origin-left rounded-full bg-primary transition-transform duration-300 ease-house"
            style={{
              transform: `scaleX(${(props.stepIndex + 1) / props.totalSteps})`,
            }}
          />
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="field" value={props.field} />

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-semibold"
        >
          {t(`fields.${props.field}.title`)}
        </h1>

        {props.kind === "single" ? (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">{t(`fields.${props.field}.title`)}</legend>
            {singleOptions.map((option) => (
              <label key={option} className={optionClass}>
                <input
                  type="radio"
                  name="value"
                  value={option}
                  required
                  defaultChecked={props.initialValue === option}
                />
                {t(`options.${props.field}.${option}`)}
              </label>
            ))}
          </fieldset>
        ) : null}

        {props.kind === "multi" ? (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">{t(`fields.${props.field}.title`)}</legend>
            <p className="text-sm text-ink-subtle">{t("fields.goals.hint")}</p>
            {GOAL_IDS.map((goal) => (
              <label key={goal} className={optionClass}>
                <input
                  type="checkbox"
                  name="value"
                  value={goal}
                  defaultChecked={
                    Array.isArray(props.initialValue) &&
                    props.initialValue.includes(goal)
                  }
                />
                {t(`options.goals.${goal}`)}
              </label>
            ))}
          </fieldset>
        ) : null}

        {props.kind === "number" ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="value" className="text-sm text-ink-subtle">
              {t(`fields.${props.field}.hint`)}
            </label>
            <input
              id="value"
              name="value"
              type="text"
              inputMode="decimal"
              required
              pattern="[0-9]+([.,][0-9]+)?"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
              className={inputClass}
            />
            {props.field === "targetWeightKg" && props.currentWeightKg ? (
              <GuardrailBanner
                currentWeightKg={props.currentWeightKg}
                targetValue={numberValue}
              />
            ) : null}
          </div>
        ) : null}

        {props.kind === "date" ? (
          <DateOfBirthField
            initialValue={
              typeof props.initialValue === "string" ? props.initialValue : ""
            }
          />
        ) : null}

        {props.kind === "text" ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink-subtle">{t("optionalHint")}</p>
            <textarea
              name="value"
              rows={4}
              aria-label={t(`fields.${props.field}.title`)}
              defaultValue={
                typeof props.initialValue === "string" ? props.initialValue : ""
              }
              className={inputClass}
            />
          </div>
        ) : null}

        {state?.errorKey ? (
          <p
            role="alert"
            className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
          >
            {t(`errors.${state.errorKey}`)}
          </p>
        ) : null}

        <div className="flex items-center justify-between">
          {props.stepIndex > 0 ? (
            <Link
              href={`/mi-espacio/evaluacion?paso=${props.stepIndex - 1}`}
              className="inline-flex h-11 items-center rounded-full border border-hairline bg-surface-1 px-5 text-sm font-semibold text-ink transition-[transform,box-shadow,border-color,background-color,color] duration-500 ease-house hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150"
            >
              {t("back")}
            </Link>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? t("saving") : t("next")}
          </Button>
        </div>
      </form>
    </main>
  );
}
