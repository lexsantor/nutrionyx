import { describe, expect, it } from "vitest";
import {
  activeDays,
  expectedDoses,
  proteinAdherence,
  windowDelta,
} from "./adherence";

describe("adherence report", () => {
  it("expected doses: weekly 4, daily 28", () => {
    expect(expectedDoses("WEEKLY")).toBe(4);
    expect(expectedDoses("DAILY")).toBe(28);
  });

  it("protein: buckets by day, counts met days, averages logged days", () => {
    const d = (day: number, hour: number) =>
      new Date(2026, 7, day, hour);
    const entries = [
      { recordedAt: d(1, 9), grams: 80 },
      { recordedAt: d(1, 20), grams: 80 }, // day 1 total 160 >= 150
      { recordedAt: d(2, 12), grams: 100 }, // day 2 total 100 < 150
    ];
    const r = proteinAdherence(entries, 150);
    expect(r.daysLogged).toBe(2);
    expect(r.daysMet).toBe(1);
    expect(r.avgPerLoggedDay).toBe(130);
  });

  it("protein: empty entries", () => {
    expect(proteinAdherence([], 150)).toEqual({
      daysLogged: 0,
      daysMet: 0,
      avgPerLoggedDay: 0,
    });
  });

  it("active days: distinct local days", () => {
    expect(
      activeDays([
        new Date(2026, 7, 1, 9),
        new Date(2026, 7, 1, 22),
        new Date(2026, 7, 3, 8),
      ]),
    ).toBe(2);
  });

  it("window delta: last minus first ascending; null under 2 points", () => {
    expect(
      windowDelta([
        { recordedAt: new Date(2026, 7, 10), value: 86.2 },
        { recordedAt: new Date(2026, 7, 1), value: 88 },
      ]),
    ).toBe(-1.8);
    expect(windowDelta([{ recordedAt: new Date(), value: 80 }])).toBeNull();
  });
});
