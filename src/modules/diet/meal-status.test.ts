import { describe, expect, it } from "vitest";
import { MEAL_NOTE_MAX, NOTE_STATUSES, keepsNote } from "./meal-status";

describe("keepsNote", () => {
  // The note explains why the plan and the day diverged. A meal marked done
  // has no divergence, so keeping the note would leave "cené fuera" sitting
  // on a meal the record says was eaten as prescribed.
  it("keeps a note only where the plan and the day diverged", () => {
    expect(keepsNote("CHANGED")).toBe(true);
    expect(keepsNote("SKIPPED")).toBe(true);
    expect(keepsNote("DONE")).toBe(false);
    expect(keepsNote(null)).toBe(false);
  });

  it("agrees with the list the repository queries on", () => {
    for (const status of NOTE_STATUSES) {
      expect(keepsNote(status)).toBe(true);
    }
    expect(NOTE_STATUSES).not.toContain("DONE");
  });

  it("bounds the note, because a record is read in a consultation", () => {
    expect(MEAL_NOTE_MAX).toBeGreaterThan(0);
    expect(MEAL_NOTE_MAX).toBeLessThanOrEqual(500);
  });
});
