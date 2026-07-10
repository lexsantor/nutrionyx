"use client";

import { useActionState, useState } from "react";
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
  "block w-full rounded-[10px] border border-hairline bg-surface-2 px-3.5 py-2.5 text-base text-ink placeholder:text-ink-tertiary";

const optionClass =
  "flex cursor-pointer items-center gap-3 rounded-[10px] border border-hairline px-4 py-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-subtle";

export function WizardStep(props: StepProps) {
  const t = useTranslations("wizard");
  const [state, formAction, isPending] = useActionState<
    WizardFormState,
    FormData
  >(submitAnswer, null);
  const [numberValue, setNumberValue] = useState(
    typeof props.initialValue === "string" ? props.initialValue : "",
  );

  const singleOptions =
    props.field === "sex"
      ? SEXES
      : props.field === "activityLevel"
        ? ACTIVITY_LEVELS
        : [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-ink-subtle">
          {t("progress", { step: props.stepIndex + 1, total: props.totalSteps })}
        </p>
        <div
          role="progressbar"
          aria-valuenow={props.stepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={props.totalSteps}
          className="h-1.5 w-full overflow-hidden rounded-full bg-surface-4"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${((props.stepIndex + 1) / props.totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="field" value={props.field} />

        <h1 className="text-xl font-semibold">
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
          <input
            name="value"
            type="date"
            required
            aria-label={t(`fields.${props.field}.title`)}
            defaultValue={
              typeof props.initialValue === "string" ? props.initialValue : ""
            }
            className={inputClass}
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
              className="text-sm font-medium text-ink-subtle underline underline-offset-2 hover:text-ink"
            >
              {t("back")}
            </Link>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={isPending}>
            {t("next")}
          </Button>
        </div>
      </form>
    </main>
  );
}
