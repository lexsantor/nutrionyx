import { prisma } from "@/lib/prisma";
import type { Organization, SpecialtyType } from "@/generated/prisma/client";

/**
 * Mirror of the Better Auth organization inside the domain database.
 * Idempotent: safe to call on every org bootstrap or login.
 */
export async function ensureOrganization(
  authOrgId: string,
  name: string,
): Promise<Organization> {
  // Idempotent existence check. On update we do NOT touch name: the mirror is
  // the source of truth for the consulta's display name, editable in Settings
  // (the specialist renames it there), so we must not clobber it on every load.
  return prisma.organization.upsert({
    where: { authOrgId },
    create: { authOrgId, name },
    update: {},
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
  specialtyType: SpecialtyType | null;
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
      specialtyType: true,
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

export async function updateOrgProfile(
  organizationId: string,
  input: OrgProfileInput,
): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: input,
  });
}

/**
 * Specialist sub-role (adr/0006). Configuration only, never RBAC. Org-scoped
 * (the organizationId comes from the session, never from client input) and
 * freely editable, including after the first patient.
 */
export async function updateSpecialtyType(
  organizationId: string,
  specialtyType: SpecialtyType,
): Promise<void> {
  await prisma.organization.update({
    where: { id: organizationId },
    data: { specialtyType },
  });
}

export async function getSpecialtyType(
  organizationId: string,
): Promise<SpecialtyType | null> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { specialtyType: true },
  });
  return org?.specialtyType ?? null;
}
