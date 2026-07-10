import { findPatientByAuthUserId } from "@/modules/patient/repository";

export type UserRole = "patient" | "nutritionist";

/**
 * Resolve which area a signed-in user belongs to, from the domain mirror -
 * not from Better Auth membership. A Patient row keyed by authUserId is the
 * authoritative "this user acts as a patient" signal (set on invitation
 * acceptance, patient/repository.ts). Everyone else is a nutritionist (org
 * owner). Routing and page gating must use this, never "has a session" or
 * "belongs to an org" (a patient is a member of the nutritionist's org).
 */
export async function resolveUserRole(authUserId: string): Promise<UserRole> {
  const patient = await findPatientByAuthUserId(authUserId);
  return patient ? "patient" : "nutritionist";
}
