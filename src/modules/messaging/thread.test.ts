import { describe, expect, it } from "vitest";
import { dayLabelKind, groupThread, type ThreadMessage } from "./thread";

const at = (iso: string, sender = "PATIENT", id = iso): ThreadMessage => ({
  id,
  sender,
  body: "x",
  createdAt: new Date(iso),
});

describe("groupThread", () => {
  it("returns nothing for an empty thread", () => {
    expect(groupThread([])).toEqual([]);
  });

  it("collapses consecutive messages from the same side into one run", () => {
    const days = groupThread([
      at("2026-08-12T10:00:00Z", "PATIENT", "a"),
      at("2026-08-12T10:01:00Z", "PATIENT", "b"),
      at("2026-08-12T11:00:00Z", "SPECIALIST", "c"),
      at("2026-08-12T11:05:00Z", "PATIENT", "d"),
    ]);
    expect(days).toHaveLength(1);
    expect(days[0].runs.map((r) => r.messages.map((m) => m.id))).toEqual([
      ["a", "b"],
      ["c"],
      ["d"],
    ]);
  });

  it("splits by Madrid calendar day, not by UTC day", () => {
    // 23:30 and 00:30 Madrid in August (UTC+2) are 21:30Z and 22:30Z of the
    // same UTC day, and two different days for the person reading them.
    const days = groupThread([
      at("2026-08-12T21:30:00Z", "PATIENT", "night"),
      at("2026-08-12T22:30:00Z", "PATIENT", "after-midnight"),
    ]);
    expect(days.map((d) => d.key)).toEqual(["2026-08-12", "2026-08-13"]);
  });

  // The run is scoped to the day, so midnight always breaks it even when the
  // same person wrote both sides of it. That is the separator doing its job.
  it("never lets a run cross midnight", () => {
    const days = groupThread([
      at("2026-08-12T21:30:00Z", "PATIENT", "before"),
      at("2026-08-12T22:30:00Z", "PATIENT", "after"),
    ]);
    expect(days).toHaveLength(2);
    expect(days[0].runs).toHaveLength(1);
    expect(days[1].runs).toHaveLength(1);
  });

  it("keeps the order it was given", () => {
    const days = groupThread([
      at("2026-08-10T08:00:00Z", "PATIENT", "1"),
      at("2026-08-11T08:00:00Z", "SPECIALIST", "2"),
      at("2026-08-12T08:00:00Z", "PATIENT", "3"),
    ]);
    expect(days.map((d) => d.key)).toEqual([
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
    ]);
  });
});

describe("dayLabelKind", () => {
  const now = new Date("2026-08-14T09:00:00Z");

  it("names today and yesterday, and dates everything else", () => {
    expect(dayLabelKind("2026-08-14", now)).toEqual({ kind: "today" });
    expect(dayLabelKind("2026-08-13", now)).toEqual({ kind: "yesterday" });
    expect(dayLabelKind("2026-08-12", now)).toEqual({ kind: "date" });
  });

  // Spain moves the clock on the last Sunday of October. The day before the
  // 26th is the 25th whether that Sunday ran 23, 24 or 25 hours.
  it("holds across the autumn DST shift", () => {
    const monday = new Date("2026-10-26T09:00:00Z");
    expect(dayLabelKind("2026-10-26", monday)).toEqual({ kind: "today" });
    expect(dayLabelKind("2026-10-25", monday)).toEqual({ kind: "yesterday" });
  });
});
