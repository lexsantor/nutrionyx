import { prisma } from "@/lib/prisma";
import type { ConsentKind } from "@/generated/prisma/client";

/**
 * DPA/GDPR consent log (adr/0006). Append-only: a specialist accepts the
 * data-processing terms at activation, before inviting any patient. Never
 * updated or deleted - a new acceptance (e.g. a new terms version) is a new
 * row. Org-scoped: every query is filtered by the organizationId sourced from
 * the caller's session, never from client input.
 *
 * v1 ships a versioned PLACEHOLDER DPA (owner sign-off, adr/0006); the real
 * legal text lands before go-live. Only the version string and the mechanism
 * matter here - bump CURRENT_DPA_VERSION when the text changes to require
 * re-acceptance.
 */
export const CURRENT_DPA_VERSION = "dpa-placeholder-2026-07";

export async function recordConsent(params: {
  organizationId: string;
  kind?: ConsentKind;
  termsVersion: string;
  acceptedByAuthUserId: string;
}): Promise<void> {
  await prisma.consentRecord.create({
    data: {
      organizationId: params.organizationId,
      kind: params.kind ?? "DPA",
      termsVersion: params.termsVersion,
      acceptedByAuthUserId: params.acceptedByAuthUserId,
    },
  });
}

/**
 * True when the org has an accepted consent of this kind. If `version` is
 * given, the acceptance must match that exact version (a newer terms version
 * therefore reads as "not accepted" until re-accepted).
 */
export async function hasAcceptedConsent(
  organizationId: string,
  kind: ConsentKind = "DPA",
  version?: string,
): Promise<boolean> {
  const row = await prisma.consentRecord.findFirst({
    where: {
      organizationId,
      kind,
      ...(version ? { termsVersion: version } : {}),
    },
    select: { id: true },
  });
  return row != null;
}
