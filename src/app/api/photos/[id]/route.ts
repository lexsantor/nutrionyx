import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { getPhoto } from "@/modules/photos/repository";
import { getPrivate } from "@/lib/blob-private";

export const dynamic = "force-dynamic";

/**
 * Auth-gated photo stream (docs/build/slice-14-plan.md). Access: the owner
 * patient, or a nutritionist of the same org. Never the platform admin
 * (operator-blindness). The blob store is private - this route is the only
 * way a photo reaches a browser.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const role = await resolveUserRole(session.user.id);
  let organizationId: string | null = null;
  let patientScope: string | null = null;

  if (role === "patient") {
    const patient = await findPatientByAuthUserId(session.user.id);
    if (!patient) return new Response("Not found", { status: 404 });
    organizationId = patient.organizationId;
    patientScope = patient.id;
  } else if (role === "nutritionist") {
    const { data: organizations } = await auth.organization.list();
    const active = organizations?.[0];
    if (!active) return new Response("Not found", { status: 404 });
    const org = await ensureOrganization(active.id, active.name);
    organizationId = org.id;
  } else {
    // Platform admin: operator-blindness.
    return new Response("Forbidden", { status: 403 });
  }

  const photo = await getPhoto(organizationId, id);
  if (!photo || (patientScope != null && photo.patientId !== patientScope)) {
    return new Response("Not found", { status: 404 });
  }

  let file;
  try {
    file = await getPrivate(photo.pathname);
  } catch (error) {
    console.error("[photos] blob read failed", error);
    return new Response("Not found", { status: 404 });
  }
  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(file.stream, {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "private, max-age=300",
    },
  });
}
