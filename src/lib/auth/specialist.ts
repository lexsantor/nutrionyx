import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import type { Organization } from "@/generated/prisma/client";

/**
 * Console guard: session -> domain role -> active org (mirrored). Redirects
 * out of the console when any step fails. cache() dedupes the resolution
 * across the (console) layout and the page within one request.
 */
export const requireSpecialistOrg = cache(
  async (): Promise<{ userId: string; org: Organization }> => {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      redirect("/auth/sign-in");
    }

    // Gate by domain role, not membership: patients and platform admins go
    // to their own area.
    const role = await resolveUserRole(session.user.id);
    if (role !== "nutritionist") {
      redirect(roleHome(role));
    }

    const { data: organizations } = await auth.organization.list();
    if (!organizations || organizations.length === 0) {
      redirect("/panel/nueva-organizacion");
    }

    const active = organizations[0];
    // Idempotent self-repair: the domain mirror always matches the auth org.
    const org = await ensureOrganization(active.id, active.name);
    return { userId: session.user.id, org };
  },
);
