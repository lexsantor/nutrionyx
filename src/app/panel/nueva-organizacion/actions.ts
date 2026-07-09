"use server";

import { auth } from "@/lib/auth/server";
import { ensureOrganization } from "@/modules/organization/repository";
import { orgSlug } from "@/modules/organization/slug";
import { redirect } from "next/navigation";

export type OrgFormState = { errorKey: string } | null;

export async function createOrganization(
  _prevState: OrgFormState,
  formData: FormData,
): Promise<OrgFormState> {
  const name = (formData.get("name") as string)?.trim();

  if (!name) {
    return { errorKey: "nameRequired" };
  }

  const { data, error } = await auth.organization.create({
    name,
    slug: orgSlug(name),
  });

  if (error || !data) {
    return { errorKey: "generic" };
  }

  // Mirror into the domain database (org-scoped models hang off this row).
  await ensureOrganization(data.id, name);

  await auth.organization.setActive({ organizationId: data.id });

  redirect("/panel");
}
