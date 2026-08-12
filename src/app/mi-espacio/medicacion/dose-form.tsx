"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InjectionSite } from "@/generated/prisma/client";
import { DoseStepper } from "./plan-form";
import { logDoseAction, type MedicationFormState } from "./actions";

import type { Sex } from "@/generated/prisma/client";

/**
 * Injection sites over the anatomical mannequin, the same figure the body
 * map uses (public/mannequin-{sex}-front.png). The crude blob of circles
 * and rounded rectangles this replaces asked a patient to place a needle
 * on a shape that was not a body.
 *
 * Percentages are derived from the calibrated bands in
 * components/body-map-measures.tsx, which were measured off each render's
 * alpha channel: arms from the ARM band, belly from WAIST, thighs from
 * THIGH. The female figure carries a wider hip and a slightly wider arm
 * line, so its columns differ.
 *
 * Viewer-mirrored, because the patient is facing their own front: the site
 * they call "izquierdo" appears on the left of the picture.
 */
type Spot = { x: number; y: number };
const SITE_POSITIONS: Record<"MALE" | "FEMALE", Record<InjectionSite, Spot>> = {
  // Measured off each render's alpha channel, not derived: at 34% of the
  // image the silhouette breaks into three runs (arm, torso, arm) and the
  // arm centres fall where these say; at 46% the torso spans 36-64 for the
  // male and 35-65 for the female, so the abdominal pair sits just inside
  // its edges; at 62% the two legs are separate runs.
  MALE: {
    LEFT_ARM: { x: 31.8, y: 34 },
    RIGHT_ARM: { x: 68.3, y: 34 },
    LEFT_BELLY: { x: 41, y: 46 },
    RIGHT_BELLY: { x: 59, y: 46 },
    LEFT_THIGH: { x: 41.2, y: 62 },
    RIGHT_THIGH: { x: 59, y: 62 },
  },
  FEMALE: {
    LEFT_ARM: { x: 32.9, y: 34 },
    RIGHT_ARM: { x: 67.2, y: 34 },
    LEFT_BELLY: { x: 41, y: 46 },
    RIGHT_BELLY: { x: 59, y: 46 },
    LEFT_THIGH: { x: 41.1, y: 62 },
    RIGHT_THIGH: { x: 59.1, y: 62 },
  },
};

function BodyMap({
  sex,
  suggested,
  selected,
  onSelect,
}: {
  sex: Sex | null;
  suggested: InjectionSite;
  selected: InjectionSite;
  onSelect: (site: InjectionSite) => void;
}) {
  const t = useTranslations("medication");
  const figure = sex === "FEMALE" ? "FEMALE" : "MALE";
  const spots = SITE_POSITIONS[figure];

  return (
    <div className="relative mx-auto aspect-[614/1100] w-56">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/mannequin-${figure.toLowerCase()}-front.png`}
        alt=""
        width={614}
        height={1100}
        className="h-full w-full object-contain"
      />
      {(Object.keys(spots) as InjectionSite[]).map((site) => (
        <label
          key={site}
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{ left: `${spots[site].x}%`, top: `${spots[site].y}%` }}
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
  sex,
}: {
  planDoseMg: number;
  suggested: InjectionSite;
  todayISO: string;
  /** From the completed assessment; the figure follows it. */
  sex: Sex | null;
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
        <BodyMap
          sex={sex}
          suggested={suggested}
          selected={site}
          onSelect={setSite}
        />
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
