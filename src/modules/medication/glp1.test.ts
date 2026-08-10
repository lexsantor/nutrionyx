import { describe, expect, it } from "vitest";
import {
  SITE_ROTATION,
  suggestNextSite,
  nextDoseDate,
  daysUntil,
} from "./glp1";

describe("suggestNextSite", () => {
  it("starts at the first site when there is no history", () => {
    expect(suggestNextSite(null)).toBe("LEFT_BELLY");
  });

  it("cycles through all six sites and wraps", () => {
    let site = SITE_ROTATION[0];
    const seen = [site];
    for (let i = 0; i < 5; i++) {
      site = suggestNextSite(site);
      seen.push(site);
    }
    expect(new Set(seen).size).toBe(6);
    expect(suggestNextSite(site)).toBe(SITE_ROTATION[0]);
  });
});

describe("nextDoseDate", () => {
  const wed = 3;
  const weekly = { frequency: "WEEKLY" as const, shotDay: wed };
  // 2026-08-10 is a Monday.
  const monday = new Date("2026-08-10T09:00:00");

  it("weekly, never dosed: next shot day from today", () => {
    const next = nextDoseDate(weekly, null, monday);
    expect(next.getDay()).toBe(wed);
    expect(daysUntil(next, monday)).toBe(2);
  });

  it("weekly, dosed on schedule: one week later", () => {
    const lastWed = new Date("2026-08-05T18:00:00");
    const next = nextDoseDate(weekly, lastWed, monday);
    expect(next.getDay()).toBe(wed);
    expect(next.getDate()).toBe(12);
  });

  it("weekly, dosed a day late: re-aligns to the shot day", () => {
    const lastThu = new Date("2026-08-06T18:00:00");
    const next = nextDoseDate(weekly, lastThu, monday);
    expect(next.getDay()).toBe(wed);
    expect(next.getDate()).toBe(12);
  });

  it("weekly, overdue: returns a past date (UI shows due today)", () => {
    const oldDose = new Date("2026-07-15T18:00:00");
    const next = nextDoseDate(weekly, oldDose, monday);
    expect(daysUntil(next, monday)).toBeLessThanOrEqual(0);
  });

  it("daily: last dose + 1 day", () => {
    const daily = { frequency: "DAILY" as const, shotDay: null };
    const next = nextDoseDate(daily, new Date("2026-08-09T08:00:00"), monday);
    expect(daysUntil(next, monday)).toBe(0);
  });
});
