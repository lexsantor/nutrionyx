import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Append-only domain event log (docs/09_Domain_Model.md).
 * Events are facts: never updated, never deleted.
 *
 * **Payloads carry identifiers, never values.** An event records that
 * something happened and points at the row that holds the detail; it does
 * not copy the detail in. The rule is not stylistic: this table is the one
 * clinical-adjacent store the platform operator is allowed to read
 * (adr/0004 operator-blindness, `/admin/auditoria`), so a weight, a BMI, a
 * drug name or an email in a payload leaks special-category data to a
 * reader who must never see it. Categories are fine (`kind`, `sender`); the
 * measured number is not.
 *
 * events.test.ts enforces this over the literal payloads in this module
 * tree, so a new call site cannot quietly reintroduce it.
 */
export async function appendEvent(params: {
  organizationId: string;
  aggregate: "Patient" | "Assessment" | "Organization";
  aggregateId: string;
  type: string;
  payload: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.domainEvent.create({ data: params });
}
