import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Platform-admin data access (docs/build/slice-3-plan.md, adr/0004).
 * Operator-blindness: this module reads only business/platform data -
 * organizations, counts, access codes - and NEVER clinical tables
 * (assessment, measurement). Every function here returns business fields
 * or aggregates only.
 */

export async function isPlatformAdmin(authUserId: string): Promise<boolean> {
  const admin = await prisma.platformAdmin.findUnique({
    where: { authUserId },
  });
  return admin != null;
}

export type ConsultaSummary = {
  id: string;
  name: string;
  createdAt: Date;
  patientCount: number;
};

export async function listConsultas(): Promise<ConsultaSummary[]> {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { patients: true } },
    },
  });
  return orgs.map((o) => ({
    id: o.id,
    name: o.name,
    createdAt: o.createdAt,
    patientCount: o._count.patients,
  }));
}

export type PlatformMetrics = {
  consultas: number;
  patients: number;
  codesUsed: number;
  codesPending: number;
};

export async function platformMetrics(): Promise<PlatformMetrics> {
  const [consultas, patients, codesUsed, codesPending] = await Promise.all([
    prisma.organization.count(),
    prisma.patient.count(),
    prisma.specialistAccessCode.count({ where: { usedAt: { not: null } } }),
    prisma.specialistAccessCode.count({ where: { usedAt: null } }),
  ]);
  return { consultas, patients, codesUsed, codesPending };
}

export type AccessCodeRow = {
  code: string;
  note: string | null;
  used: boolean;
  createdAt: Date;
};

export async function listAccessCodes(): Promise<AccessCodeRow[]> {
  const rows = await prisma.specialistAccessCode.findMany({
    orderBy: { createdAt: "desc" },
    select: { code: true, note: true, usedAt: true, createdAt: true },
  });
  return rows.map((r) => ({
    code: r.code,
    note: r.note,
    used: r.usedAt != null,
    createdAt: r.createdAt,
  }));
}

export async function createAccessCode(params: {
  note?: string;
  createdBy: string;
}): Promise<string> {
  const code = `NTX-${randomBytes(4).toString("hex").toUpperCase()}`;
  await prisma.specialistAccessCode.create({
    data: { code, note: params.note ?? null, createdBy: params.createdBy },
  });
  return code;
}

/**
 * Revoke an UNUSED code. Guarded: deleteMany with usedAt null, so a redeemed
 * code can never be revoked (its audit trail stays). Returns true if a code
 * was removed.
 */
export async function revokeAccessCode(code: string): Promise<boolean> {
  const result = await prisma.specialistAccessCode.deleteMany({
    where: { code, usedAt: null },
  });
  return result.count === 1;
}

export type PlatformEvent = {
  id: string;
  organizationId: string;
  aggregate: string;
  aggregateId: string;
  type: string;
  createdAt: Date;
};

export const EVENTS_PAGE_SIZE = 50;

/**
 * The append-only trail, for the platform audit view.
 *
 * `payload` is deliberately NOT selected. Operator-blindness (adr/0004)
 * keeps this module out of clinical tables, and several event payloads
 * carry exactly that: AssessmentCompleted stores a BMI, BodyMetricRecorded
 * and WeightRecorded store measured values, MedicationPlanSet stores a drug
 * name and dose, PatientCreated stores an email. Rendering them here would
 * hand the operator special-category health data through the back door.
 *
 * What an audit trail owes its reader is who touched what and when. That
 * is the shape returned: organization, aggregate, id, type, timestamp.
 */
export async function listPlatformEvents(filters: {
  organizationId?: string;
  type?: string;
  since?: Date;
  page?: number;
}): Promise<{ rows: PlatformEvent[]; total: number }> {
  const where = {
    ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.since ? { createdAt: { gte: filters.since } } : {}),
  };
  const page = Math.max(1, filters.page ?? 1);
  const [rows, total] = await Promise.all([
    prisma.domainEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * EVENTS_PAGE_SIZE,
      take: EVENTS_PAGE_SIZE,
      select: {
        id: true,
        organizationId: true,
        aggregate: true,
        aggregateId: true,
        type: true,
        createdAt: true,
      },
    }),
    prisma.domainEvent.count({ where }),
  ]);
  return { rows, total };
}

/** Distinct event types present, for the filter. */
export async function listEventTypes(): Promise<string[]> {
  const rows = await prisma.domainEvent.groupBy({
    by: ["type"],
    orderBy: { type: "asc" },
  });
  return rows.map((r) => r.type);
}
