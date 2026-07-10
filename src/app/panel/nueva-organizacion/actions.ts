"use server";

import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import {
  redeemAccessCode,
  releaseAccessCode,
} from "@/modules/organization/access-code";
import { ensureOrganization } from "@/modules/organization/repository";
import { orgSlug } from "@/modules/organization/slug";
import { redirect } from "next/navigation";

export type OrgFormState = { errorKey: string } | null;

export async function createOrganization(
  _prevState: OrgFormState,
  formData: FormData,
): Promise<OrgFormState> {
  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("accessCode") as string)?.trim();

  if (!name) {
    return { errorKey: "nameRequired" };
  }
  if (!code) {
    return { errorKey: "codeRequired" };
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
  await ensureOrganization(data.id, name);

  await auth.organization.setActive({ organizationId: data.id });

  redirect("/panel");
}
