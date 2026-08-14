import { prisma } from "@/lib/prisma";
import { appendEvent } from "@/modules/events";
import { MEAL_SLOTS, type MealSlot } from "./plan";
import type { MealStatus } from "@/generated/prisma/client";

/**
 * How the prescribed week actually went (docs/build/slice-30-plan.md).
 *
 * The patient marks each meal of the plan done, changed or skipped. This is
 * deliberately not a food diary of photographs: the plan is already
 * structured, so a tick against it produces a number the report can use,
 * costs the patient seconds rather than four photos a day, and stores no
 * Article 9 imagery anyone has to review.
 *
 * Org-scoped like every repository here (LPEF Prisma R2/R4): the
 * organizationId comes from the caller's session, never from the request.
 */

// The pure half lives in ./meal-status so a client component can import it
// without pulling Prisma into the browser bundle.
import {
  MEAL_NOTE_MAX,
  NOTE_STATUSES,
  keepsNote,
  type DayLog,
} from "./meal-status";

export type { MealStatus, MealMark, DayLog } from "./meal-status";
export { MEAL_NOTE_MAX, keepsNote } from "./meal-status";

/** Midnight of a Madrid calendar day, which is what the column stores. */
function dayKey(day: Date): Date {
  return new Date(
    Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()),
  );
}

export async function setMealStatus(params: {
  organizationId: string;
  patientId: string;
  day: Date;
  slot: MealSlot;
  /** null clears the mark, which is how a patient undoes a mis-tap. */
  status: MealStatus | null;
}): Promise<void> {
  const day = dayKey(params.day);
  const where = {
    patientId_day_slot: {
      patientId: params.patientId,
      day,
      slot: params.slot,
    },
  };

  let mealLogId: string;
  if (params.status === null) {
    const existing = await prisma.mealLog.findFirst({
      where: {
        organizationId: params.organizationId,
        patientId: params.patientId,
        day,
        slot: params.slot,
      },
      select: { id: true },
    });
    if (!existing) return;
    mealLogId = existing.id;
    await prisma.mealLog.delete({ where: { id: existing.id } });
  } else {
    const row = await prisma.mealLog.upsert({
      where,
      create: {
        organizationId: params.organizationId,
        patientId: params.patientId,
        day,
        slot: params.slot,
        status: params.status,
      },
      // Back to DONE drops whatever the patient had written about the change.
      update: {
        status: params.status,
        ...(keepsNote(params.status) ? {} : { note: null }),
      },
      select: { id: true },
    });
    mealLogId = row.id;
  }

  // Identifiers only. The first version put `slot` and `status` in here, and
  // modules/events.test.ts was right to reject it: "DINNER / SKIPPED" tells
  // the platform operator that this patient skipped dinner, which is exactly
  // the clinical fact operator-blindness exists to keep from them (adr/0004).
  await appendEvent({
    organizationId: params.organizationId,
    aggregate: "Patient",
    aggregateId: params.patientId,
    type: "MealLogged",
    payload: { mealLogId },
  });
}

/**
 * Attach (or clear) the note on a meal already marked. Separate from
 * setMealStatus because the buttons post on tap and the note is typed after;
 * folding them into one action would let saving a note change a status.
 *
 * Updates nothing when the meal is not marked, or is marked DONE: there is
 * no divergence to explain. Silent rather than an error - the only way to
 * reach it is a stale form, and the patient has already moved on.
 */
export async function setMealNote(params: {
  organizationId: string;
  patientId: string;
  day: Date;
  slot: MealSlot;
  note: string | null;
}): Promise<void> {
  const trimmed = params.note?.trim().slice(0, MEAL_NOTE_MAX) || null;
  await prisma.mealLog.updateMany({
    where: {
      organizationId: params.organizationId,
      patientId: params.patientId,
      day: dayKey(params.day),
      slot: params.slot,
      status: { in: [...NOTE_STATUSES] },
    },
    data: { note: trimmed },
  });
  // No event: the status change already emitted one, and the payload would
  // carry nothing new that operator-blindness allows (adr/0004).
}

/** One day's marks, keyed by slot. */
export async function getDayLog(
  organizationId: string,
  patientId: string,
  day: Date,
): Promise<DayLog> {
  const rows = await prisma.mealLog.findMany({
    where: { organizationId, patientId, day: dayKey(day) },
    select: { slot: true, status: true, note: true },
  });
  const out: DayLog = {};
  for (const row of rows) {
    if ((MEAL_SLOTS as readonly string[]).includes(row.slot)) {
      out[row.slot as MealSlot] = { status: row.status, note: row.note };
    }
  }
  return out;
}

export type MealNote = {
  day: Date;
  slot: MealSlot;
  status: MealStatus;
  note: string;
};

/**
 * What the patient wrote about the meals that diverged, newest first. This is
 * the whole point of the note: before it, a specialist saw that a meal had
 * changed and nothing about what to.
 *
 * Capped, because a record is read in a consultation and a chatty month
 * should not bury the rest of the page. The caller says how many.
 */
export async function recentMealNotes(
  organizationId: string,
  patientId: string,
  since: Date,
  limit = 20,
): Promise<MealNote[]> {
  const rows = await prisma.mealLog.findMany({
    where: {
      organizationId,
      patientId,
      day: { gte: dayKey(since) },
      note: { not: null },
    },
    orderBy: [{ day: "desc" }, { slot: "asc" }],
    take: limit,
    select: { day: true, slot: true, status: true, note: true },
  });
  return rows.flatMap((row) =>
    (MEAL_SLOTS as readonly string[]).includes(row.slot) && row.note
      ? [{ day: row.day, slot: row.slot as MealSlot, status: row.status, note: row.note }]
      : [],
  );
}

export type MealAdherence = {
  /** Meals marked done, out of every meal marked at all. */
  done: number;
  marked: number;
  /** Days with at least one mark, so "no data" is distinguishable. */
  daysWithMarks: number;
};

/**
 * Adherence over a window. Only marked meals count: an unmarked meal means
 * the patient said nothing, which is not the same as a meal they skipped,
 * and reporting it as a miss would punish them for not using the app.
 */
export async function mealAdherence(
  organizationId: string,
  patientId: string,
  since: Date,
): Promise<MealAdherence> {
  const rows = await prisma.mealLog.findMany({
    where: { organizationId, patientId, day: { gte: dayKey(since) } },
    select: { day: true, status: true },
  });
  const days = new Set(rows.map((row) => row.day.toISOString().slice(0, 10)));
  return {
    done: rows.filter((row) => row.status === "DONE").length,
    marked: rows.length,
    daysWithMarks: days.size,
  };
}


export type SlotAdherence = {
  slot: MealSlot;
  done: number;
  marked: number;
};

/**
 * The same window, split by meal. A single percentage says a patient follows
 * 70% of their plan; this says they skip the merienda, which is a problem
 * with the merienda and not with the patient.
 *
 * Slots the patient never marked are left out: a meal that is not in the
 * plan should not appear as a meal they failed.
 */
export async function adherenceBySlot(
  organizationId: string,
  patientId: string,
  since: Date,
): Promise<SlotAdherence[]> {
  const rows = await prisma.mealLog.groupBy({
    by: ["slot", "status"],
    where: { organizationId, patientId, day: { gte: dayKey(since) } },
    _count: { _all: true },
  });

  const tally = new Map<MealSlot, { done: number; marked: number }>();
  for (const row of rows) {
    if (!(MEAL_SLOTS as readonly string[]).includes(row.slot)) continue;
    const slot = row.slot as MealSlot;
    const entry = tally.get(slot) ?? { done: 0, marked: 0 };
    entry.marked += row._count._all;
    if (row.status === "DONE") entry.done += row._count._all;
    tally.set(slot, entry);
  }

  // MEAL_SLOTS order, not database order: a specialist reads a day top to
  // bottom, and breakfast before dinner is the only order that means
  // anything.
  return MEAL_SLOTS.flatMap((slot) => {
    const entry = tally.get(slot);
    return entry ? [{ slot, ...entry }] : [];
  });
}
