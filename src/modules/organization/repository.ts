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

// --- Consulta profile (docs/build/slice-4-plan.md) ---

export type OrgProfile = {
  id: string;
  name: string;
  legalName: string | null;
  taxId: string | null;
  addressLine: string | null;
  locality: string | null;
  postalCode: string | null;
  country: string | null;
  hours: string | null;
  logoUrl: string | null;
  slug: string | null;
};

export async function getOrgProfile(
  organizationId: string,
): Promise<OrgProfile | null> {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      legalName: true,
      taxId: true,
      addressLine: true,
      locality: true,
      postalCode: true,
      country: true,
      hours: true,
      logoUrl: true,
      slug: true,
    },
  });
}

export async function isSlugTaken(
  slug: string,
  exceptOrganizationId: string,
): Promise<boolean> {
  const existing = await prisma.organization.findFirst({
    where: { slug, NOT: { id: exceptOrganizationId } },
    select: { id: true },
  });
  return existing != null;
}

export type OrgProfileInput = {
  legalName: string | null;
  taxId: string | null;
  addressLine: string | null;
  locality: string | null;
  postalCode: string | null;
  country: string | null;
  hours: string | null;
  logoUrl: string | null;
  slug: string | null;
};

export async function updateOrgProfile(
  organizationId: string,
  input: OrgProfileInput,
): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: input,
  });
}
