"use server";

import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import {
  redeemAccessCode,
  releaseAccessCode,
} from "@/modules/organization/access-code";
import {
  ensureOrganization,
  updateSpecialtyType,
} from "@/modules/organization/repository";
import {
  CURRENT_DPA_VERSION,
  recordConsent,
} from "@/modules/organization/consent";
import { SPECIALTY_TYPES } from "@/modules/specialty/config";
import { orgSlug } from "@/modules/organization/slug";
import type { SpecialtyType } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

export type OrgFormState = { errorKey: string } | null;

export async function createOrganization(
  _prevState: OrgFormState,
  formData: FormData,
): Promise<OrgFormState> {
  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("accessCode") as string)?.trim();
  const specialtyRaw = (formData.get("specialtyType") as string)?.trim();
  const consent = formData.get("consent") === "on";

  if (!name) {
    return { errorKey: "nameRequired" };
  }
  if (!code) {
    return { errorKey: "codeRequired" };
  }
  // Sub-role must be one of the two known values (adr/0006).
  if (!SPECIALTY_TYPES.includes(specialtyRaw as SpecialtyType)) {
    return { errorKey: "specialtyRequired" };
  }
  const specialtyType = specialtyRaw as SpecialtyType;
  // DPA/GDPR consent is the required activation gate (adr/0006): no consulta
  // is created without it.
  if (!consent) {
    return { errorKey: "consentRequired" };
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic" };
  }
  // Patients never create consultas (they only exist via invitation).
  if ((await resolveUserRole(session.user.id)) === "patient") {
    console.error("[createOrganization] patient attempted to create org", {
      userId: session.user.id,
    });
    return { errorKey: "generic" };
  }

  // Claim the single-use code before creating anything (docs/adr/0003).
  const claimed = await redeemAccessCode(code, session.user.id);
  if (!claimed) {
    return { errorKey: "invalidCode" };
  }

  const { data, error } = await auth.organization.create({
    name,
    slug: orgSlug(name),
  });

  if (error || !data) {
    console.error("[createOrganization] org create failed", error);
    // Don't burn a valid code on a transient failure.
    await releaseAccessCode(code, session.user.id);
    return { errorKey: "generic" };
  }

  // Mirror into the domain database (org-scoped models hang off this row).
  const org = await ensureOrganization(data.id, name);

  // Persist the sub-role and record the DPA consent for this consulta
  // (adr/0006). Both are org-scoped to the row we just created.
  await updateSpecialtyType(org.id, specialtyType);
  await recordConsent({
    organizationId: org.id,
    termsVersion: CURRENT_DPA_VERSION,
    acceptedByAuthUserId: session.user.id,
  });

  await auth.organization.setActive({ organizationId: data.id });

  redirect("/panel");
}
