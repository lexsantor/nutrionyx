"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import {
  ensureOrganization,
  isSlugTaken,
  updateOrgProfile,
} from "@/modules/organization/repository";
import { orgSlug } from "@/modules/organization/slug";

export type ProfileFormState = { errorKey: string } | { ok: true } | null;

function field(formData: FormData, key: string): string | null {
  const value = ((formData.get(key) as string) ?? "").trim();
  return value || null;
}

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic" };
  }
  // Only the owning specialist edits their consulta.
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[updateProfileAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return { errorKey: "generic" };
  }

  const { data: activeOrg, error } = await auth.organization.getFullOrganization();
  if (!activeOrg) {
    console.error("[updateProfileAction] no active organization", error);
    return { errorKey: "noOrganization" };
  }
  const org = await ensureOrganization(activeOrg.id, activeOrg.name);

  const name = field(formData, "name");
  if (!name) {
    return { errorKey: "nameRequired" };
  }

  // Slug: normalize; default from the new name; reject a taken one.
  const rawSlug = field(formData, "slug");
  const slug = orgSlug(rawSlug ?? name);
  if (slug && (await isSlugTaken(slug, org.id))) {
    return { errorKey: "slugTaken" };
  }

  try {
    await updateOrgProfile(org.id, {
      name,
      legalName: field(formData, "legalName"),
      taxId: field(formData, "taxId"),
      addressLine: field(formData, "addressLine"),
      locality: field(formData, "locality"),
      postalCode: field(formData, "postalCode"),
      country: field(formData, "country") ?? "ES",
      hours: field(formData, "hours"),
      logoUrl: field(formData, "logoUrl"),
      slug: slug || null,
    });
  } catch (err) {
    console.error("[updateProfileAction] updateOrgProfile failed", err);
    return { errorKey: "generic" };
  }

  revalidatePath("/panel/ajustes");
  revalidatePath("/panel");
  return { ok: true };
}
