/**
 * Madrid wall-clock parsing (docs/build/slice-20-plan.md). The app is
 * single-market (ES): inputs mean Europe/Madrid regardless of server
 * timezone; storage is a UTC instant.
 * ponytail: naive around the DST transition hour itself; per-user
 * timezones when a non-ES market exists.
 */
const ZONE = "Europe/Madrid";

/** "YYYY-MM-DD" + "HH:mm" in Madrid wall-clock -> UTC Date, null if invalid. */
export function madridToUtc(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }
  const guess = new Date(`${date}T${time}:00Z`);
  if (Number.isNaN(guess.getTime())) return null;
  // What wall time does that instant show in Madrid? The difference is the
  // zone offset at that date (handles CET/CEST).
  const shown = new Date(
    guess
      .toLocaleString("sv-SE", { timeZone: ZONE })
      .replace(" ", "T") + "Z",
  );
  return new Date(guess.getTime() - (shown.getTime() - guess.getTime()));
}

/** Start of a Madrid calendar day (offset in whole days from today) as UTC. */
export function madridDayStart(offsetDays: number, now: Date = new Date()): Date {
  const ymd = now.toLocaleDateString("sv-SE", { timeZone: ZONE });
  const base = madridToUtc(ymd, "00:00")!;
  return new Date(base.getTime() + offsetDays * 86_400_000);
}
