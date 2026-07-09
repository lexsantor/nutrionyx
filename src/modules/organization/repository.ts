import { prisma } from "@/lib/prisma";
import type { Organization } from "@/generated/prisma/client";

/**
 * Mirror of the Better Auth organization inside the domain database.
 * Idempotent: safe to call on every org bootstrap or login.
 */
export async function ensureOrganization(
  authOrgId: string,
  name: string,
): Promise<Organization> {
  return prisma.organization.upsert({
    where: { authOrgId },
    create: { authOrgId, name },
    update: { name },
  });
}

export async function findByAuthOrgId(
  authOrgId: string,
): Promise<Organization | null> {
  return prisma.organization.findUnique({ where: { authOrgId } });
}
