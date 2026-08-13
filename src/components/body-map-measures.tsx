"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BODY_ZONES,
  type BodyZoneKey,
  type ZoneStat,
} from "@/modules/measurement/body";

/**
 * Interactive body map (patterned after the owner's progreso-corporal
 * reference): detailed front/back silhouette with measurement bands per
 * zone, leader-line labels, and a side panel with the selected zone's
 * current value vs initial and vs previous. Deltas render direction-only
 * (a smaller arm is not universally "good").
 */

type PlainZoneStat = Omit<
  ZoneStat,
  "currentDate" | "initialDate" | "previousDate"
> & {
  currentDate: string;
  initialDate: string;
  previousDate: string | null;
};

export type PlainZones = Partial<Record<BodyZoneKey, PlainZoneStat>>;

// Calibrated per render set by measuring the silhouette's alpha channel
// (viewBox 200 x 358 over 1536x2752). The female figure carries the bust
// lower and the hip/glute apex ~12 units below the male one.
type Band = Record<BodyZoneKey, { y: number; x1: number; x2: number }>;
const BANDS: Record<"MALE" | "FEMALE", Band> = {
  MALE: {
    CHEST_CM: { y: 107, x1: 61, x2: 139 },
    ARM_CM: { y: 122, x1: 36, x2: 55 },
    WAIST_CM: { y: 153, x1: 71, x2: 129 },
    HIP_CM: { y: 177, x1: 68, x2: 132 },
    THIGH_CM: { y: 228, x1: 70, x2: 99 },
    GLUTE_CM: { y: 173, x1: 66, x2: 134 },
    CALF_CM: { y: 297, x1: 73, x2: 98 },
  },
  FEMALE: {
    CHEST_CM: { y: 112, x1: 63, x2: 137 },
    ARM_CM: { y: 122, x1: 40, x2: 58 },
    WAIST_CM: { y: 153, x1: 71, x2: 129 },
    HIP_CM: { y: 188, x1: 64, x2: 136 },
    THIGH_CM: { y: 228, x1: 70, x2: 99 },
    GLUTE_CM: { y: 188, x1: 62, x2: 138 },
    CALF_CM: { y: 297, x1: 73, x2: 98 },
  },
};

function fmt(v: number) {
  return v.toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function Delta({ delta }: { delta: number | null }) {
  if (delta == null) {
    return <span className="text-ink-subtle">—</span>;
  }
  const dir = delta < -0.05 ? "down" : delta > 0.05 ? "up" : "flat";
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "±";
  return (
    <span className="inline-flex items-center gap-1 tabular-nums text-ink-subtle">
      {dir === "flat" ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={dir === "up" ? "" : "rotate-180"}><path d="M12 19V5M5 12l7-7 7 7"/></svg>
      )}
      {sign}
      {fmt(Math.abs(delta))} cm
    </span>
  );
}

export function BodyMapMeasures({
  zones,
  sex,
}: {
  zones: PlainZones;
  sex?: "MALE" | "FEMALE" | null;
}) {
  const t = useTranslations("body");
  const [view, setView] = useState<"front" | "back">("front");
  const [selected, setSelected] = useState<BodyZoneKey | null>(null);

  const figure = sex === "FEMALE" ? "FEMALE" : "MALE";
  const band = BANDS[figure];
  const zonesInView = BODY_ZONES.filter((z) => z.view === view);
  const selData = selected ? (zones[selected] ?? null) : null;

  const segBtn = (on: boolean) =>
    `inline-flex h-8 items-center rounded-full px-3 text-sm font-medium transition-colors duration-200 ${
      on
        ? "bg-primary text-on-primary"
        : "text-ink-subtle hover:bg-surface-3 hover:text-ink"
    }`;

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label={t("map.viewLabel")}
        className="flex w-fit items-center gap-1 rounded-full border border-hairline bg-surface-2 p-1"
      >
        <button
          aria-pressed={view === "front"}
          className={segBtn(view === "front")}
          onClick={() => setView("front")}
        >
          {t("map.front")}
        </button>
        <button
          aria-pressed={view === "back"}
          className={segBtn(view === "back")}
          onClick={() => setView("back")}
        >
          {t("map.back")}
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <div
          className="relative mx-auto h-80 w-auto sm:h-96"
          style={{ aspectRatio: "200/358" }}
        >
          {/* Both views render so the counterpart PNG is already fetched
              when the toggle flips; a fade over an unloaded image asserts
              a readiness that is not there. */}
          {(["front", "back"] as const).map((v) => (
            <Image
              key={v}
              src={`/mannequin-${figure.toLowerCase()}-${v}.png`}
              alt=""
              width={614}
              height={1100}
              className={`h-full w-full object-contain [filter:drop-shadow(0_12px_20px_rgba(11,15,20,0.18))] ${
                v === view ? "" : "hidden"
              }`}
            />
          ))}
          <svg
            viewBox="0 0 200 358"
            role="group"
            aria-label={t("map.figureLabel")}
            className="absolute inset-0 h-full w-full"
          >
          {zonesInView.map((zone, i) => {
            const { y, x1, x2 } = band[zone.key];
            const data = zones[zone.key];
            const isSel = selected === zone.key;
            const labelRight = i % 2 === 0;
            const lx = labelRight ? 198 : 2;
            const anchor = labelRight ? "end" : "start";
            const lineEnd = labelRight ? 176 : 24;
            return (
              <g
                key={zone.key}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={`${t(`zones.${zone.key}`)}: ${
                  data ? `${fmt(data.current)} cm` : t("map.noData")
                }`}
                className="cursor-pointer"
                onClick={() => setSelected(isSel ? null : zone.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(isSel ? null : zone.key);
                  }
                }}
              >
                <rect
                  x={Math.min(x1, lineEnd) - 6}
                  y={y - 16}
                  width={Math.abs(Math.max(x2, lineEnd) - Math.min(x1, lineEnd)) + 12}
                  height={32}
                  fill="transparent"
                />
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  strokeWidth={isSel ? 2.5 : 1.75}
                  className={`transition-[stroke,stroke-width] ${
                    isSel ? "stroke-primary" : "stroke-ink/50"
                  }`}
                />
                <line
                  x1={labelRight ? x2 : x1}
                  y1={y}
                  x2={lineEnd}
                  y2={y}
                  strokeWidth="0.75"
                  className="stroke-ink/30"
                  strokeDasharray="2 3"
                />
                <circle
                  cx={labelRight ? x2 : x1}
                  cy={y}
                  r="3"
                  className={`transition-[fill] ${
                    isSel ? "fill-primary" : "fill-ink/50"
                  }`}
                />
                <text
                  x={lx}
                  y={y - 4.5}
                  textAnchor={anchor}
                  className="fill-ink-muted text-[11px] font-medium"
                >
                  {t(`zones.${zone.key}`)}
                </text>
                <text
                  x={lx}
                  y={y + 10.5}
                  textAnchor={anchor}
                  className={`text-[12px] font-semibold tabular-nums transition-[fill] ${
                    isSel ? "fill-primary" : "fill-ink"
                  }`}
                >
                  {data ? `${fmt(data.current)} cm` : "—"}
                </text>
              </g>
            );
          })}
          </svg>
        </div>

        {/* Persistent live region: mounted always so selection changes announce. */}
        <div aria-live="polite">
        {selected && selData ? (
          <div
            key={selected}
            className="flex h-fit animate-fade-in flex-col gap-3 rounded-xl border border-hairline bg-surface-2 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold">
                {t(`zones.${selected}`)}
              </h3>
              <button
                aria-label={t("map.close")}
                onClick={() => setSelected(null)}
                className="flex size-9 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <p className="font-display text-3xl font-semibold tabular-nums">
              {fmt(selData.current)}
              <span className="ml-1 text-base font-normal text-ink-subtle">
                cm
              </span>
            </p>
            <p className="text-xs text-ink-subtle">
              {t("map.measuredOn", { date: selData.currentDate })}
            </p>
            <dl className="flex flex-col gap-1.5 border-t border-hairline pt-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-subtle">
                  {t("map.vsInitial", { date: selData.initialDate })}
                </dt>
                <dd>
                  <Delta
                    delta={selData.points > 1 ? selData.deltaInitial : null}
                  />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-subtle">{t("map.vsPrevious")}</dt>
                <dd>
                  <Delta delta={selData.deltaPrevious} />
                </dd>
              </div>
            </dl>
            {selData.points < 2 ? (
              <p className="text-xs text-ink-subtle">{t("map.onePoint")}</p>
            ) : null}
          </div>
        ) : (
          <div className="flex h-fit flex-col gap-1.5">
            {BODY_ZONES.map((zone) => {
              const data = zones[zone.key];
              return (
                <button
                  key={zone.key}
                  onClick={() => {
                    setView(zone.view);
                    setSelected(zone.key);
                  }}
                  className="flex items-center justify-between gap-3 rounded-[10px] px-3 py-2 text-left text-sm transition-colors duration-200 hover:bg-surface-2"
                >
                  <span className="font-medium">{t(`zones.${zone.key}`)}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold tabular-nums">
                      {data ? `${fmt(data.current)} cm` : "—"}
                    </span>
                    <Delta
                      delta={
                        data && data.points > 1 ? data.deltaInitial : null
                      }
                    />
                  </span>
                </button>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
