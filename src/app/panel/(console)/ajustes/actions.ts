"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import {
  isSlugTaken,
  updateOrgProfile,
  updateSpecialtyType,
} from "@/modules/organization/repository";
import {
  CURRENT_DPA_VERSION,
  recordConsent,
} from "@/modules/organization/consent";
import { SPECIALTY_TYPES } from "@/modules/specialty/config";
import { orgSlug } from "@/modules/organization/slug";
import type { SpecialtyType } from "@/generated/prisma/client";

export type ProfileFormState =
  | { errorKey: string; values?: Record<string, string> }
  | { ok: true }
  | null;

/**
 * React 19 resets the form once the action resolves, so without echoing
 * the submitted values a rejected save empties every field the specialist
 * had just filled in. Same rule as the week editors.
 */
function echo(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    [...formData.entries()]
      .filter(([, v]) => typeof v === "string")
      .map(([k, v]) => [k, v as string]),
  );
}

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
    return { errorKey: "generic", values: echo(formData) };
  }
  // Only the owning specialist edits their consulta.
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[updateProfileAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return { errorKey: "generic", values: echo(formData) };
  }

  const { org } = await requireSpecialistOrg();

  const name = field(formData, "name");
  if (!name) {
    return { errorKey: "nameRequired", values: echo(formData) };
  }

  // Slug: normalize; default from the new name; reject a taken one.
  const rawSlug = field(formData, "slug");
  const slug = orgSlug(rawSlug ?? name);
  if (slug && (await isSlugTaken(slug, org.id))) {
    return { errorKey: "slugTaken", values: echo(formData) };
  }

  // Logo upload (docs/build/slice-10-plan.md): branding asset, public Blob.
  // A chosen file wins over the URL field; without one the URL field rules.
  let logoUrl = field(formData, "logoUrl");
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
    if (!ALLOWED.includes(logo.type) || logo.size > 2 * 1024 * 1024) {
      return { errorKey: "invalidLogo" };
    }
    try {
      const ext = logo.type.split("/")[1];
      const blob = await put(`logos/${org.id}.${ext}`, logo, {
        access: "public",
        addRandomSuffix: true,
      });
      logoUrl = blob.url;
    } catch (err) {
      console.error("[updateProfileAction] blob upload failed", err);
      return { errorKey: "logoUploadFailed" };
    }
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
      logoUrl,
      slug: slug || null,
    });
  } catch (err) {
    console.error("[updateProfileAction] updateOrgProfile failed", err);
    return { errorKey: "generic", values: echo(formData) };
  }

  revalidatePath("/panel/ajustes");
  revalidatePath("/panel");
  return { ok: true };
}

export type SpecialtyFormState = { errorKey: string } | { ok: true } | null;

/** Edit the specialist sub-role (adr/0006). Configuration only, freely editable. */
export async function updateSpecialtyAction(
  _prevState: SpecialtyFormState,
  formData: FormData,
): Promise<SpecialtyFormState> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic" };
  }
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[updateSpecialtyAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return { errorKey: "generic" };
  }

  const raw = (formData.get("specialtyType") as string)?.trim();
  if (!SPECIALTY_TYPES.includes(raw as SpecialtyType)) {
    return { errorKey: "generic" };
  }
  const { org } = await requireSpecialistOrg();
  await updateSpecialtyType(org.id, raw as SpecialtyType);

  revalidatePath("/panel/ajustes");
  revalidatePath("/panel");
  return { ok: true };
}

/**
 * Accept the DPA/GDPR consent for the active consulta (adr/0006). Used by the
 * backfill soft-prompt for consultas created before the consent gate existed.
 */
export async function acceptConsentAction(): Promise<void> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return;
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[acceptConsentAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return;
  }
  const { org } = await requireSpecialistOrg();
  await recordConsent({
    organizationId: org.id,
    termsVersion: CURRENT_DPA_VERSION,
    acceptedByAuthUserId: session.user.id,
  });
  revalidatePath("/panel/ajustes");
}
