"use client";

import { useActionState, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GLP1_PRESETS } from "@/modules/medication/glp1";
import { savePlanAction, type MedicationFormState } from "./actions";

/** Big touch-friendly mg stepper shared by the plan and dose forms. */
export function DoseStepper({
  name,
  label,
  initialMg,
}: {
  name: string;
  label: string;
  initialMg: number | null;
}) {
  const id = useId();
  const [value, setValue] = useState(
    initialMg != null ? String(initialMg).replace(".", ",") : "",
  );

  const bump = (delta: number) => {
    const current = Number(value.replace(",", "."));
    const base = Number.isFinite(current) ? current : 0;
    const next = Math.min(100, Math.max(0.25, base + delta));
    setValue(String(Math.round(next * 100) / 100).replace(".", ","));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => bump(-0.25)}
          aria-label="−0,25 mg"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-2 text-lg font-semibold text-ink transition-[transform,background-color,border-color] hover:bg-surface-3 active:scale-[0.97] active:duration-150"
        >
          −
        </button>
        <Input
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0,25"
          className="text-center text-lg font-semibold tabular-nums"
        />
        <button
          type="button"
          onClick={() => bump(0.25)}
          aria-label="+0,25 mg"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-2 text-lg font-semibold text-ink transition-[transform,background-color,border-color] hover:bg-surface-3 active:scale-[0.97] active:duration-150"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Monday-first week, values in JS getDay() convention (0 = Sunday).
const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 0];

export function PlanForm({
  initial,
}: {
  initial: {
    drugName: string;
    frequency: "WEEKLY" | "DAILY";
    doseMg: number;
    shotDay: number | null;
  } | null;
}) {
  const t = useTranslations("medication");
  const [state, formAction, isPending] = useActionState<
    MedicationFormState,
    FormData
  >(savePlanAction, null);

  const initialPreset = initial
    ? (GLP1_PRESETS.find((p) => p.brand === initial.drugName)?.key ?? "custom")
    : GLP1_PRESETS[0].key;
  const [preset, setPreset] = useState<string>(initialPreset);
  const selected = GLP1_PRESETS.find((p) => p.key === preset) ?? null;
  const [customFrequency, setCustomFrequency] = useState<"WEEKLY" | "DAILY">(
    initial?.frequency ?? "WEEKLY",
  );
  const frequency = selected ? selected.frequency : customFrequency;
  const [shotDay, setShotDay] = useState<number>(initial?.shotDay ?? 1);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">{t("setup.drugLabel")}</legend>
        <div className="grid grid-cols-2 gap-2">
          {GLP1_PRESETS.map((p) => (
            <label
              key={p.key}
              className={`flex cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring flex-col gap-0.5 rounded-[10px] border px-3.5 py-2.5 transition-colors ${
                preset === p.key
                  ? "border-primary bg-surface-2"
                  : "border-hairline bg-surface-1 hover:bg-surface-2"
              }`}
            >
              <input
                type="radio"
                name="preset"
                value={p.key}
                checked={preset === p.key}
                onChange={() => setPreset(p.key)}
                className="sr-only"
              />
              <span className="text-sm font-semibold">{p.brand}</span>
              <span className="text-xs text-ink-subtle">
                {p.generic} · {t(`setup.frequencies.${p.frequency}`)}
              </span>
            </label>
          ))}
          <label
            className={`flex cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring flex-col justify-center gap-0.5 rounded-[10px] border px-3.5 py-2.5 transition-colors ${
              preset === "custom"
                ? "border-primary bg-surface-2"
                : "border-hairline bg-surface-1 hover:bg-surface-2"
            }`}
          >
            <input
              type="radio"
              name="preset"
              value="custom"
              checked={preset === "custom"}
              onChange={() => setPreset("custom")}
              className="sr-only"
            />
            <span className="text-sm font-semibold">{t("setup.custom")}</span>
          </label>
        </div>
      </fieldset>

      {preset === "custom" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="drugName" className="text-sm font-medium">
              {t("setup.customDrugLabel")}
            </label>
            <Input
              id="drugName"
              name="drugName"
              type="text"
              required
              maxLength={80}
              defaultValue={
                initial && initialPreset === "custom" ? initial.drugName : ""
              }
            />
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">
              {t("setup.frequencyLabel")}
            </legend>
            <div className="flex gap-2">
              {(["WEEKLY", "DAILY"] as const).map((f) => (
                <label
                  key={f}
                  className={`inline-flex h-9 cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring items-center rounded-full border px-4 text-sm font-medium transition-colors ${
                    customFrequency === f
                      ? "border-primary bg-surface-2"
                      : "border-hairline bg-surface-1 hover:bg-surface-2"
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={f}
                    checked={customFrequency === f}
                    onChange={() => setCustomFrequency(f)}
                    className="sr-only"
                  />
                  {t(`setup.frequencies.${f}`)}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      ) : null}

      <DoseStepper
        name="doseMg"
        label={t("setup.doseLabel")}
        initialMg={initial?.doseMg ?? null}
      />

      {frequency === "WEEKLY" ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">
            {t("setup.shotDayLabel")}
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {WEEK_DAYS.map((d) => (
              <label
                key={d}
                className={`inline-flex h-9 min-w-11 cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring items-center justify-center rounded-full border px-2 text-sm font-medium transition-colors ${
                  shotDay === d
                    ? "border-primary bg-surface-2"
                    : "border-hairline bg-surface-1 hover:bg-surface-2"
                }`}
              >
                <input
                  type="radio"
                  name="shotDay"
                  value={d}
                  checked={shotDay === d}
                  onChange={() => setShotDay(d)}
                  className="sr-only"
                />
                {t(`setup.weekDays.${d}`)}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? t("setup.saving") : t("setup.save")}
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
          {t("setup.saved")}
        </p>
        ) : null}
        </div>
    </form>
  );
}
