import { prisma } from "@/lib/prisma";

/**
 * Specialist onboarding gate (docs/adr/0003): creating a consulta requires
 * a single-use access code issued by the Nutrionyx owner. Redemption is
 * atomic - the guard (code + usedAt null) lives in the WHERE, so a used or
 * unknown code is a no-op, not a race. Returns true only if this call
 * claimed the code.
 */
export async function redeemAccessCode(
  code: string,
  authUserId: string,
): Promise<boolean> {
  const result = await prisma.specialistAccessCode.updateMany({
    where: { code, usedAt: null },
    data: { usedAt: new Date(), usedBy: authUserId },
  });
  return result.count === 1;
}

/**
 * Release a code claimed by this user when the org creation that followed
 * failed, so a valid code is not burned by a transient error.
 */
export async function releaseAccessCode(
  code: string,
  authUserId: string,
): Promise<void> {
  await prisma.specialistAccessCode.updateMany({
    where: { code, usedBy: authUserId },
    data: { usedAt: null, usedBy: null },
  });
}
