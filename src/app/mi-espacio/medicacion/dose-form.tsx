"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InjectionSite } from "@/generated/prisma/client";
import { DoseStepper } from "./plan-form";
import { logDoseAction, type MedicationFormState } from "./actions";

// Viewer-mirrored (patient facing their own front): "izquierdo" on the left.
const SITE_POSITIONS: Record<InjectionSite, { x: number; y: number }> = {
  LEFT_ARM: { x: 13, y: 30 },
  RIGHT_ARM: { x: 87, y: 30 },
  LEFT_BELLY: { x: 39, y: 46 },
  RIGHT_BELLY: { x: 61, y: 46 },
  LEFT_THIGH: { x: 41, y: 68 },
  RIGHT_THIGH: { x: 59, y: 68 },
};

function BodyMap({
  suggested,
  selected,
  onSelect,
}: {
  suggested: InjectionSite;
  selected: InjectionSite;
  onSelect: (site: InjectionSite) => void;
}) {
  const t = useTranslations("medication");

  return (
    <div className="relative mx-auto h-64 w-44">
      <svg
        viewBox="0 0 100 90"
        className="h-full w-full fill-ink/10"
        aria-hidden="true"
      >
        <circle cx="50" cy="9" r="7" />
        <path d="M38 18h24a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8Z" />
        <rect x="24" y="20" width="6" height="27" rx="3" />
        <rect x="70" y="20" width="6" height="27" rx="3" />
        <rect x="38" y="50" width="10" height="36" rx="5" />
        <rect x="52" y="50" width="10" height="36" rx="5" />
      </svg>
      {(Object.keys(SITE_POSITIONS) as InjectionSite[]).map((site) => (
        <label
          key={site}
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{
            left: `${SITE_POSITIONS[site].x}%`,
            top: `${SITE_POSITIONS[site].y}%`,
          }}
        >
          <input
            type="radio"
            name="site"
            value={site}
            checked={selected === site}
            onChange={() => onSelect(site)}
            className="peer sr-only"
          />
          <span
            className={`flex size-9 items-center justify-center rounded-full border-2 bg-surface-1/90 transition-colors peer-checked:border-primary peer-checked:border-solid peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring ${
              site === suggested
                ? "border-dashed border-primary"
                : "border-hairline-strong"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`text-on-primary transition-opacity ${selected === site ? "opacity-100" : "opacity-0"}`}
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span className="sr-only">{t(`sites.${site}`)}</span>
        </label>
      ))}
    </div>
  );
}

export function DoseForm({
  planDoseMg,
  suggested,
  todayISO,
}: {
  planDoseMg: number;
  suggested: InjectionSite;
  todayISO: string;
}) {
  const t = useTranslations("medication");
  const [state, formAction, isPending] = useActionState<
    MedicationFormState,
    FormData
  >(logDoseAction, null);
  const [site, setSite] = useState<InjectionSite>(suggested);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <DoseStepper
        name="doseMg"
        label={t("log.doseLabel")}
        initialMg={planDoseMg}
      />

      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm font-medium">{t("log.siteLabel")}</legend>
        <BodyMap suggested={suggested} selected={site} onSelect={setSite} />
        <p className="text-center text-sm font-medium">{t(`sites.${site}`)}</p>
        {site !== suggested ? (
          <p className="text-center text-xs text-ink-subtle">
            {t("log.suggested", { site: t(`sites.${suggested}`) })}
          </p>
        ) : (
          <p className="text-center text-xs text-ink-subtle">
            {t("log.suggestedThis")}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="takenAt" className="text-sm font-medium">
          {t("log.dateLabel")}
        </label>
        <Input
          id="takenAt"
          name="takenAt"
          type="date"
          defaultValue={todayISO}
          max={todayISO}
        />
      </div>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? t("log.saving") : t("log.save")}
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
          {t("log.saved")}
        </p>
        ) : null}
        </div>
    </form>
  );
}
