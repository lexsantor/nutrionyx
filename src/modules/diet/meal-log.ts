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

export type { MealStatus };

export type DayLog = Partial<Record<MealSlot, MealStatus>>;

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
      update: { status: params.status },
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

/** One day's marks, keyed by slot. */
export async function getDayLog(
  organizationId: string,
  patientId: string,
  day: Date,
): Promise<DayLog> {
  const rows = await prisma.mealLog.findMany({
    where: { organizationId, patientId, day: dayKey(day) },
    select: { slot: true, status: true },
  });
  const out: DayLog = {};
  for (const row of rows) {
    if ((MEAL_SLOTS as readonly string[]).includes(row.slot)) {
      out[row.slot as MealSlot] = row.status;
    }
  }
  return out;
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
