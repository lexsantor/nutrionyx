import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { getDocument } from "@/modules/documents/repository";
import { getPrivate } from "@/lib/blob-private";

export const dynamic = "force-dynamic";

/**
 * Auth-gated document stream (docs/build/slice-16-plan.md). Owner patient
 * or a nutritionist of the same org; the platform admin never
 * (operator-blindness). Same access model as the photo route.
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
    return new Response("Forbidden", { status: 403 });
  }

  const document = await getDocument(organizationId, id);
  if (
    !document ||
    (patientScope != null && document.patientId !== patientScope)
  ) {
    return new Response("Not found", { status: 404 });
  }

  let file;
  try {
    file = await getPrivate(document.pathname);
  } catch (error) {
    console.error("[documents] blob read failed", error);
    return new Response("Not found", { status: 404 });
  }
  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  const safeName = document.fileName.replace(/[^\w.\- ]/g, "_");
  return new Response(file.stream, {
    headers: {
      "Content-Type": document.contentType,
      "Content-Disposition": `inline; filename="${safeName}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
