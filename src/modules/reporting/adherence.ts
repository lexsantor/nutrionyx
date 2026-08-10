/**
 * 28-day adherence report (docs/build/slice-15-plan.md). Pure math over
 * rows the caller fetched; local-time day buckets like the rest of the app.
 */
export const REPORT_WINDOW_DAYS = 28;

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Expected doses in the window for a medication plan. */
export function expectedDoses(
  frequency: "WEEKLY" | "DAILY",
  windowDays: number = REPORT_WINDOW_DAYS,
): number {
  return frequency === "WEEKLY" ? Math.floor(windowDays / 7) : windowDays;
}

/** Per-day protein totals -> adherence vs a daily target. */
export function proteinAdherence(
  entries: { recordedAt: Date; grams: number }[],
  targetG: number,
): { daysLogged: number; daysMet: number; avgPerLoggedDay: number } {
  const byDay = new Map<string, number>();
  for (const entry of entries) {
    const key = dayKey(entry.recordedAt);
    byDay.set(key, (byDay.get(key) ?? 0) + entry.grams);
  }
  const totals = [...byDay.values()];
  const daysLogged = totals.length;
  const daysMet = totals.filter((total) => total >= targetG).length;
  const avgPerLoggedDay =
    daysLogged > 0
      ? Math.round(totals.reduce((a, b) => a + b, 0) / daysLogged)
      : 0;
  return { daysLogged, daysMet, avgPerLoggedDay };
}

/** Distinct local days with at least one timestamp. */
export function activeDays(dates: Date[]): number {
  return new Set(dates.map(dayKey)).size;
}

/** First-vs-last delta over entries sorted ascending; null under 2 points. */
export function windowDelta(
  values: { recordedAt: Date; value: number }[],
): number | null {
  if (values.length < 2) return null;
  const sorted = [...values].sort(
    (a, b) => a.recordedAt.getTime() - b.recordedAt.getTime(),
  );
  return (
    Math.round((sorted[sorted.length - 1].value - sorted[0].value) * 10) / 10
  );
}
