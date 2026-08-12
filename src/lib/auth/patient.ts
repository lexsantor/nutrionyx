import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import type { Patient } from "@/generated/prisma/client";

/**
 * Patient-space guard, mirroring lib/auth/specialist.ts: session -> the
 * Patient row it belongs to. Redirects out when either is missing.
 * cache() dedupes the resolution across a layout and its page within one
 * request.
 */
export const requirePatient = cache(
  async (): Promise<{ userId: string; name: string; patient: Patient }> => {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      redirect("/auth/sign-in");
    }
    const patient = await findPatientByAuthUserId(session.user.id);
    if (!patient) {
      redirect("/");
    }
    return {
      userId: session.user.id,
      name: session.user.name,
      patient,
    };
  },
);
