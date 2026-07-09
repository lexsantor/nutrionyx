"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { ensureOrganization } from "@/modules/organization/repository";
import {
  createInvitedPatient,
  findPatientByEmail,
  removeInvitedPatient,
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

export async function cancelInvitation(formData: FormData): Promise<void> {
  const invitationId = formData.get("invitationId") as string;
  if (!invitationId) return;

  const { data: activeOrg } = await auth.organization.getFullOrganization();
  if (!activeOrg) return;

  // Read the invitation first: we need the email to clean up the
  // domain row, and cancelling must stay scoped to the active org.
  const { data: invitation } = await auth.organization.getInvitation({
    query: { id: invitationId },
  });
  if (!invitation || invitation.organizationId !== activeOrg.id) return;

  const { error } = await auth.organization.cancelInvitation({ invitationId });
  if (error) return;

  const org = await ensureOrganization(activeOrg.id, activeOrg.name);
  await removeInvitedPatient({ organizationId: org.id, email: invitation.email });

  revalidatePath("/panel");
}
