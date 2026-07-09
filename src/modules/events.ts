import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Append-only domain event log (docs/09_Domain_Model.md).
 * Events are facts: never updated, never deleted.
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
