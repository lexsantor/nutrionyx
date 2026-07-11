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
