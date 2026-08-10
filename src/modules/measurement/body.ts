import type { Measurement, MeasurementKind } from "@/generated/prisma/client";

/**
 * Body-composition derivations (docs/build/slice-12-plan.md). Pure math over
 * manual entries - estimates, not clinical measurements.
 */

/** Measurement zones drawn on the body map, in display order. */
export const BODY_ZONES = [
  { key: "CHEST_CM", view: "front" },
  { key: "ARM_CM", view: "front" },
  { key: "WAIST_CM", view: "front" },
  { key: "HIP_CM", view: "front" },
  { key: "THIGH_CM", view: "front" },
  { key: "GLUTE_CM", view: "back" },
  { key: "CALF_CM", view: "back" },
] as const;

export type BodyZoneKey = (typeof BODY_ZONES)[number]["key"];

export type ZoneStat = {
  current: number;
  currentDate: Date;
  initial: number;
  initialDate: Date;
  previous: number | null;
  previousDate: Date | null;
  deltaInitial: number;
  deltaPrevious: number | null;
  points: number;
};

/** Per-zone stats (current / vs initial / vs previous) from raw rows. */
export function zoneStats(
  rows: Pick<Measurement, "kind" | "value" | "recordedAt">[],
): Partial<Record<BodyZoneKey, ZoneStat>> {
  const out: Partial<Record<BodyZoneKey, ZoneStat>> = {};
  for (const zone of BODY_ZONES) {
    const series = rows
      .filter((r) => r.kind === (zone.key as MeasurementKind))
      .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
    if (series.length === 0) continue;
    const first = series[0];
    const last = series[series.length - 1];
    const prev = series.length > 1 ? series[series.length - 2] : null;
    const value = (m: (typeof series)[number]) => Number(m.value);
    out[zone.key] = {
      current: value(last),
      currentDate: last.recordedAt,
      initial: value(first),
      initialDate: first.recordedAt,
      previous: prev ? value(prev) : null,
      previousDate: prev ? prev.recordedAt : null,
      deltaInitial: Math.round((value(last) - value(first)) * 10) / 10,
      deltaPrevious: prev
        ? Math.round((value(last) - value(prev)) * 10) / 10
        : null,
      points: series.length,
    };
  }
  return out;
}
export function waistHipRatio(waistCm: number, hipCm: number): number | null {
  if (waistCm <= 0 || hipCm <= 0) return null;
  return Math.round((waistCm / hipCm) * 100) / 100;
}

export function fatMassKg(weightKg: number, bodyFatPct: number): number | null {
  if (weightKg <= 0 || bodyFatPct <= 0 || bodyFatPct >= 100) return null;
  return Math.round(weightKg * bodyFatPct) / 100;
}

export function leanMassKg(
  weightKg: number,
  bodyFatPct: number,
): number | null {
  const fat = fatMassKg(weightKg, bodyFatPct);
  if (fat == null) return null;
  return Math.round((weightKg - fat) * 10) / 10;
}
