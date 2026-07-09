import { describe, expect, it } from "vitest";
import { median } from "./metrics";

describe("median", () => {
  it("returns null for an empty list", () => {
    expect(median([])).toBeNull();
  });

  it("returns the middle value for odd counts", () => {
    expect(median([12, 3, 7])).toBe(7);
  });

  it("averages the two middle values for even counts", () => {
    expect(median([4, 10, 2, 8])).toBe(6);
  });

  it("does not mutate the input", () => {
    const input = [3, 1, 2];
    median(input);
    expect(input).toEqual([3, 1, 2]);
  });
});
