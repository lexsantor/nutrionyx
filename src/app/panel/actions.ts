"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
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

  // Only nutritionists invite. A patient is a member of the org, so without
  // this guard the org APIs would still resolve for them (defense in depth
  // behind the /panel role gate).
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic" };
  }
  if ((await resolveUserRole(session.user.id)) === "patient") {
    console.error("[invitePatient] patient attempted to invite", {
      userId: session.user.id,
    });
    return { errorKey: "generic" };
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

export type CancelFormState = { errorKey: string } | null;

export async function cancelInvitation(
  _prevState: CancelFormState,
  formData: FormData,
): Promise<CancelFormState> {
  const invitationId = formData.get("invitationId") as string;
  if (!invitationId) return { errorKey: "generic" };

  const { data: activeOrg, error: orgError } =
    await auth.organization.getFullOrganization();
  if (!activeOrg) {
    console.error("[cancelInvitation] no active organization", orgError);
    return { errorKey: "noOrganization" };
  }

  // getInvitation is recipient-only in Neon Auth (403 for admins), so
  // resolve the invitation through the admin-scoped list instead. This
  // also pins the operation to the active org by construction.
  const { data: pending, error: listError } =
    await auth.organization.listInvitations({
      query: { organizationId: activeOrg.id },
    });

  if (listError || !pending) {
    console.error("[cancelInvitation] listInvitations failed", listError);
    return { errorKey: "generic" };
  }

  const invitation = pending.find(
    (i) => i.id === invitationId && i.status === "pending",
  );
  if (!invitation) {
    console.error("[cancelInvitation] invitation not pending in active org", {
      invitationId,
      activeOrg: activeOrg.id,
    });
    return { errorKey: "generic" };
  }

  const { error } = await auth.organization.cancelInvitation({ invitationId });
  if (error) {
    console.error("[cancelInvitation] cancelInvitation failed", error);
    return { errorKey: "generic" };
  }

  const org = await ensureOrganization(activeOrg.id, activeOrg.name);
  await removeInvitedPatient({ organizationId: org.id, email: invitation.email });

  revalidatePath("/panel");
  return null;
}
