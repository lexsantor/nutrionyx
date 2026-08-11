import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import { addPhoto } from "@/modules/photos/repository";
import { putPrivate } from "@/lib/blob-private";

export const dynamic = "force-dynamic";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Progress-photo upload (docs/build/slice-14-plan.md). Route handler, not a
 * server action: multipart post without the server-action body limit. The
 * card submits it via fetch and refreshes the route on success.
 */
export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    return new Response("Not found", { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("photo");
  if (
    !(file instanceof File) ||
    file.size === 0 ||
    file.size > MAX_BYTES ||
    !ALLOWED.includes(file.type)
  ) {
    return Response.json({ errorKey: "invalid" }, { status: 400 });
  }

  const ext = file.type.split("/")[1];
  const pathname = `photos/${patient.organizationId}/${patient.id}/${crypto.randomUUID()}.${ext}`;
  const blob = await putPrivate(pathname, file);

  await addPhoto({
    organizationId: patient.organizationId,
    patientId: patient.id,
    pathname: blob.pathname,
    contentType: file.type,
  });

  return Response.json({ ok: true });
}
