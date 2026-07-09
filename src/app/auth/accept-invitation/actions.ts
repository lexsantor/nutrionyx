"use server";

import { auth } from "@/lib/auth/server";
import { findByAuthOrgId } from "@/modules/organization/repository";
import { activatePatient } from "@/modules/patient/repository";
import { redirect } from "next/navigation";

export type AcceptFormState = { errorKey: string } | null;

export async function acceptInvitation(
  _prevState: AcceptFormState,
  formData: FormData,
): Promise<AcceptFormState> {
  const invitationId = formData.get("invitationId") as string;
  if (!invitationId) {
    return { errorKey: "missing" };
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "notSignedIn" };
  }

  const { data, error } = await auth.organization.acceptInvitation({
    invitationId,
  });

  if (error || !data) {
    return { errorKey: "invalid" };
  }

  // Link the auth user to the invited Patient row in the org's domain data.
  const org = await findByAuthOrgId(data.invitation.organizationId);
  if (org) {
    await activatePatient({
      organizationId: org.id,
      email: session.user.email,
      authUserId: session.user.id,
    });
  }

  redirect("/mi-espacio");
}
