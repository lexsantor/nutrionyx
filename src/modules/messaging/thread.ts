import { madridToday } from "@/modules/scheduling/time";

/**
 * Shape of a thread for reading (roadmap 2026-08-14).
 *
 * The channel is asynchronous and low volume - a handful of messages a week
 * between appointments - so the thing worth encoding is *when*, not activity.
 * A month of silence is clinical context, and a flat column of bubbles each
 * stamped "12 ago 2026, 20:55" hides it behind repetition.
 *
 * Two axes, both boundaries where an off-by-one is easy and invisible:
 * messages group by Madrid calendar day, and within a day consecutive
 * messages from the same side collapse into one run, so a burst reads as one
 * turn and only its last message carries a time.
 */

export type ThreadMessage = {
  id: string;
  sender: string;
  body: string;
  createdAt: Date;
};

export type Run = { sender: string; messages: ThreadMessage[] };
export type Day = { key: string; date: Date; runs: Run[] };

export function groupThread(messages: readonly ThreadMessage[]): Day[] {
  const days: Day[] = [];

  for (const message of messages) {
    const key = madridToday(message.createdAt);
    let day = days.at(-1);
    if (!day || day.key !== key) {
      day = { key, date: message.createdAt, runs: [] };
      days.push(day);
    }

    const run = day.runs.at(-1);
    // A run never crosses a day, because the day is the outer loop: two
    // messages from the same sender either side of midnight are two runs,
    // which is right - the separator between them is the point.
    if (run && run.sender === message.sender) {
      run.messages.push(message);
    } else {
      day.runs.push({ sender: message.sender, messages: [message] });
    }
  }

  return days;
}

/**
 * Which label a day gets. Relative only where relative is clearer: "hoy" and
 * "ayer" are how someone refers to them, anything older is a date because
 * "hace 17 días" makes the reader do arithmetic.
 */
export type DayLabel = { kind: "today" } | { kind: "yesterday" } | { kind: "date" };

export function dayLabelKind(key: string, now: Date = new Date()): DayLabel {
  if (key === madridToday(now)) return { kind: "today" };
  // Through madridToday rather than date arithmetic, so a DST shift cannot
  // move the boundary: 24h before the current instant is still yesterday's
  // calendar day in Madrid whether the day was 23 or 25 hours long.
  const yesterday = madridToday(new Date(now.getTime() - 86_400_000));
  return key === yesterday ? { kind: "yesterday" } : { kind: "date" };
}
