import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { getPatientDetail } from "@/modules/patient/repository";
import { addDocument } from "@/modules/documents/repository";
import { putPrivate } from "@/lib/blob-private";

export const dynamic = "force-dynamic";

const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

/** Specialist uploads a document for a patient (docs/build/slice-16-plan.md). */
export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    return new Response("Forbidden", { status: 403 });
  }
  const { data: organizations } = await auth.organization.list();
  const active = organizations?.[0];
  if (!active) {
    return new Response("Not found", { status: 404 });
  }
  const org = await ensureOrganization(active.id, active.name);

  const formData = await request.formData();
  const patientId = (formData.get("patientId") as string) ?? "";
  const patient = await getPatientDetail(org.id, patientId);
  if (!patient) {
    return new Response("Not found", { status: 404 });
  }

  const file = formData.get("document");
  if (
    !(file instanceof File) ||
    file.size === 0 ||
    file.size > MAX_BYTES ||
    !ALLOWED.includes(file.type)
  ) {
    return Response.json({ errorKey: "invalid" }, { status: 400 });
  }

  const ext = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1];
  const pathname = `documents/${org.id}/${patient.id}/${crypto.randomUUID()}.${ext}`;
  const blob = await putPrivate(pathname, file);

  await addDocument({
    organizationId: org.id,
    patientId: patient.id,
    pathname: blob.pathname,
    contentType: file.type,
    fileName: file.name || `documento.${ext}`,
    uploadedByAuthUserId: session.user.id,
  });

  return Response.json({ ok: true });
}
