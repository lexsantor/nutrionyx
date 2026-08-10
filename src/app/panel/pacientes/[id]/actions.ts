"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { getPatientDetail } from "@/modules/patient/repository";
import { upsertTargets } from "@/modules/targets/repository";
import { addNote } from "@/modules/notes/repository";

export type TargetsFormState = { errorKey: string } | { ok: true } | null;

/** Optional bounded int; empty string means null, anything invalid rejects. */
function optionalInt(
  formData: FormData,
  key: string,
  min: number,
  max: number,
): number | null | "invalid" {
  const raw = ((formData.get(key) as string) ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) return "invalid";
  return value;
}

export async function saveTargetsAction(
  _prevState: TargetsFormState,
  formData: FormData,
): Promise<TargetsFormState> {
  const kcalTarget = optionalInt(formData, "kcalTarget", 500, 6000);
  const proteinTargetG = optionalInt(formData, "proteinTargetG", 20, 400);
  const sessionsPerWeek = optionalInt(formData, "sessionsPerWeek", 0, 14);
  if (
    kcalTarget === "invalid" ||
    proteinTargetG === "invalid" ||
    sessionsPerWeek === "invalid"
  ) {
    return { errorKey: "invalidValue" };
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic" };
  }
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[saveTargetsAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return { errorKey: "generic" };
  }

  const { data: organizations } = await auth.organization.list();
  if (!organizations || organizations.length === 0) {
    return { errorKey: "generic" };
  }
  const active = organizations[0];
  const org = await ensureOrganization(active.id, active.name);

  // Org-scoped ownership check: a foreign patient id resolves to nothing.
  const patientId = (formData.get("patientId") as string) ?? "";
  const patient = await getPatientDetail(org.id, patientId);
  if (!patient) {
    return { errorKey: "generic" };
  }

  try {
    await upsertTargets({
      organizationId: org.id,
      patientId: patient.id,
      kcalTarget,
      proteinTargetG,
      sessionsPerWeek,
    });
  } catch (error) {
    console.error("[saveTargetsAction] upsertTargets failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath(`/panel/pacientes/${patient.id}`);
  return { ok: true };
}

export type NoteFormState = { errorKey: string } | { ok: true } | null;

export async function addNoteAction(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const body = ((formData.get("body") as string) ?? "").trim();
  if (!body || body.length > 4000) {
    return { errorKey: "invalidBody" };
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { errorKey: "generic" };
  }
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[addNoteAction] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return { errorKey: "generic" };
  }

  const { data: organizations } = await auth.organization.list();
  if (!organizations || organizations.length === 0) {
    return { errorKey: "generic" };
  }
  const active = organizations[0];
  const org = await ensureOrganization(active.id, active.name);

  const patientId = (formData.get("patientId") as string) ?? "";
  const patient = await getPatientDetail(org.id, patientId);
  if (!patient) {
    return { errorKey: "generic" };
  }

  try {
    await addNote({
      organizationId: org.id,
      patientId: patient.id,
      authorAuthUserId: session.user.id,
      body,
    });
  } catch (error) {
    console.error("[addNoteAction] addNote failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath(`/panel/pacientes/${patient.id}`);
  return { ok: true };
}
