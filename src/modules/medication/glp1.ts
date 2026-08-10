import type {
  InjectionSite,
  MedicationFrequency,
} from "@/generated/prisma/client";

/**
 * GLP-1 catalog and pure scheduling logic (docs/build/slice-8-plan.md).
 * Nutrionyx never suggests doses or schedules - presets only name the drug
 * and its label frequency; the dose always comes from the patient's
 * prescriber via the patient.
 */
export const GLP1_PRESETS = [
  { key: "wegovy", brand: "Wegovy", generic: "semaglutida", frequency: "WEEKLY" },
  { key: "ozempic", brand: "Ozempic", generic: "semaglutida", frequency: "WEEKLY" },
  { key: "zepbound", brand: "Zepbound", generic: "tirzepatida", frequency: "WEEKLY" },
  { key: "mounjaro", brand: "Mounjaro", generic: "tirzepatida", frequency: "WEEKLY" },
  { key: "saxenda", brand: "Saxenda", generic: "liraglutida", frequency: "DAILY" },
  { key: "rybelsus", brand: "Rybelsus", generic: "semaglutida oral", frequency: "DAILY" },
] as const satisfies readonly {
  key: string;
  brand: string;
  generic: string;
  frequency: MedicationFrequency;
}[];

export type Glp1PresetKey = (typeof GLP1_PRESETS)[number]["key"];

/** Rotation order for subcutaneous injection sites (belly → thighs → arms). */
export const SITE_ROTATION: InjectionSite[] = [
  "LEFT_BELLY",
  "RIGHT_BELLY",
  "LEFT_THIGH",
  "RIGHT_THIGH",
  "LEFT_ARM",
  "RIGHT_ARM",
];

export function suggestNextSite(
  lastSite: InjectionSite | null,
): InjectionSite {
  if (!lastSite) return SITE_ROTATION[0];
  const index = SITE_ROTATION.indexOf(lastSite);
  return SITE_ROTATION[(index + 1) % SITE_ROTATION.length];
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0); // noon, matching how check-in dates are stored
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Next scheduled dose date. May be in the past (overdue) - the UI renders
 * anything <= today as "due today". WEEKLY plans re-align to the shot day
 * even after an early/late dose; DAILY plans are simply last dose + 1 day.
 */
export function nextDoseDate(
  plan: { frequency: MedicationFrequency; shotDay: number | null },
  lastTakenAt: Date | null,
  now: Date,
): Date {
  if (plan.frequency === "DAILY") {
    return lastTakenAt ? addDays(startOfDay(lastTakenAt), 1) : startOfDay(now);
  }
  const shotDay = plan.shotDay ?? 0;
  // From 4 days after the last dose (so a dose taken a day early or late
  // still re-aligns to the next shot day), or from today when never dosed.
  let candidate = lastTakenAt
    ? addDays(startOfDay(lastTakenAt), 4)
    : startOfDay(now);
  while (candidate.getDay() !== shotDay) {
    candidate = addDays(candidate, 1);
  }
  return candidate;
}

/** Whole days from `now` to `date`; 0 or negative means due. */
export function daysUntil(date: Date, now: Date): number {
  const ms = startOfDay(date).getTime() - startOfDay(now).getTime();
  return Math.round(ms / 86_400_000);
}
