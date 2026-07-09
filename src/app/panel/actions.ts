"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { ensureOrganization } from "@/modules/organization/repository";
import {
  createInvitedPatient,
  findPatientByEmail,
} from "@/modules/patient/repository";

export type InviteFormState =
  | { errorKey: string }
  | { ok: true }
  | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function invitePatient(
  _prevState: InviteFormState,
  formData: FormData,
): Promise<InviteFormState> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const fullName = ((formData.get("fullName") as string) ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    return { errorKey: "invalidEmail" };
  }
  if (!fullName) {
    return { errorKey: "nameRequired" };
  }

  const { data: activeOrg } = await auth.organization.getFullOrganization();
  if (!activeOrg) {
    return { errorKey: "noOrganization" };
  }

  const org = await ensureOrganization(activeOrg.id, activeOrg.name);

  const existing = await findPatientByEmail(org.id, email);
  if (existing) {
    return { errorKey: "alreadyInvited" };
  }

  // Better Auth invitation: patient joins the org with the read-only
  // "member" role. Plugin RBAC governs plugin APIs only; domain access
  // is enforced by our org-scoped repositories.
  const { error } = await auth.organization.inviteMember({
    email,
    role: "member",
    organizationId: activeOrg.id,
  });

  if (error) {
    return { errorKey: "generic" };
  }

  await createInvitedPatient({ organizationId: org.id, email, fullName });

  revalidatePath("/panel");
  return { ok: true };
}
