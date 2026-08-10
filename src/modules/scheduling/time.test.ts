import { describe, expect, it } from "vitest";
import { madridDayStart, madridToUtc } from "./time";

describe("madrid wall-clock parsing", () => {
  it("summer (CEST, +02:00): 10:00 Madrid = 08:00 UTC", () => {
    const d = madridToUtc("2026-08-15", "10:00")!;
    expect(d.toISOString()).toBe("2026-08-15T08:00:00.000Z");
  });

  it("winter (CET, +01:00): 10:00 Madrid = 09:00 UTC", () => {
    const d = madridToUtc("2026-01-15", "10:00")!;
    expect(d.toISOString()).toBe("2026-01-15T09:00:00.000Z");
  });

  it("rejects invalid input", () => {
    expect(madridToUtc("2026-8-15", "10:00")).toBeNull();
    expect(madridToUtc("2026-08-15", "25:99")).toBeNull();
  });

  it("day start: tomorrow boundary in summer", () => {
    const now = new Date("2026-08-15T20:00:00Z"); // 22:00 Madrid
    const tomorrow = madridDayStart(1, now);
    expect(tomorrow.toISOString()).toBe("2026-08-15T22:00:00.000Z"); // 00:00 CEST del 16
  });
});
