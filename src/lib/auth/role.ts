import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { isPlatformAdmin } from "@/modules/platform-admin/repository";

export type UserRole = "platform-admin" | "patient" | "nutritionist";

/**
 * Resolve which area a signed-in user belongs to, from the domain, in
 * precedence order (docs/build/slice-3-plan.md, adr/0004):
 *   platform-admin (PlatformAdmin allowlist) > patient (Patient row) >
 *   nutritionist (everyone else, i.e. an Organization Owner).
 * Routing and page gating must use this, never "has a session" or
 * "belongs to an org".
 */
export async function resolveUserRole(authUserId: string): Promise<UserRole> {
  if (await isPlatformAdmin(authUserId)) return "platform-admin";
  const patient = await findPatientByAuthUserId(authUserId);
  return patient ? "patient" : "nutritionist";
}

/** Where a role's home is. */
export function roleHome(role: UserRole): string {
  switch (role) {
    case "platform-admin":
      return "/admin";
    case "patient":
      return "/mi-espacio";
    case "nutritionist":
      return "/panel";
  }
}
