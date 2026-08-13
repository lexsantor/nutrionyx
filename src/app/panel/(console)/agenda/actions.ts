"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";
import { ensureOrganization } from "@/modules/organization/repository";
import { getPatientDetail } from "@/modules/patient/repository";
import {
  cancelAppointment,
  confirmAppointment,
  createAppointment,
} from "@/modules/scheduling/repository";
import { madridToUtc } from "@/modules/scheduling/time";

export type AppointmentFormState = { errorKey: string } | { ok: true } | null;

async function requireOrg() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  if ((await resolveUserRole(session.user.id)) !== "nutritionist") {
    console.error("[agenda] non-nutritionist attempted", {
      userId: session.user.id,
    });
    return null;
  }
  const { data: organizations } = await auth.organization.list();
  const active = organizations?.[0];
  if (!active) return null;
  const org = await ensureOrganization(active.id, active.name);
  return { org, userId: session.user.id };
}

export async function createAppointmentAction(
  _prevState: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const date = ((formData.get("date") as string) ?? "").trim();
  const time = ((formData.get("time") as string) ?? "").trim();
  const startsAt = madridToUtc(date, time);
  if (!startsAt) {
    return { errorKey: "invalidDateTime" };
  }
  if (startsAt.getTime() < Date.now()) {
    return { errorKey: "inPast" };
  }

  const durationMin = Number((formData.get("durationMin") as string) ?? "");
  if (![15, 30, 45, 60, 90].includes(durationMin)) {
    return { errorKey: "invalidDuration" };
  }

  const mode = (formData.get("mode") as string) ?? "";
  if (mode !== "IN_PERSON" && mode !== "VIDEO") {
    return { errorKey: "generic" };
  }
  const videoUrl =
    mode === "VIDEO"
      ? ((formData.get("videoUrl") as string) ?? "").trim().slice(0, 500) ||
        null
      : null;
  if (videoUrl && !/^https:\/\//.test(videoUrl)) {
    return { errorKey: "invalidVideoUrl" };
  }
  const note =
    ((formData.get("note") as string) ?? "").trim().slice(0, 500) || null;

  const ctx = await requireOrg();
  if (!ctx) return { errorKey: "generic" };

  const patientId = (formData.get("patientId") as string) ?? "";
  const patient = await getPatientDetail(ctx.org.id, patientId);
  if (!patient) {
    return { errorKey: "generic" };
  }

  try {
    await createAppointment({
      organizationId: ctx.org.id,
      patientId: patient.id,
      startsAt,
      durationMin,
      mode,
      videoUrl,
      note,
      createdByAuthUserId: ctx.userId,
    });
  } catch (error) {
    console.error("[createAppointmentAction] failed", error);
    return { errorKey: "generic" };
  }

  revalidatePath("/panel/agenda");
  revalidatePath(`/panel/pacientes/${patient.id}`);
  return { ok: true };
}

export type CancelAppointmentState = { errorKey: string } | null;

export async function cancelAppointmentAction(
  _prevState: CancelAppointmentState,
  formData: FormData,
): Promise<CancelAppointmentState> {
  const appointmentId = (formData.get("appointmentId") as string) ?? "";
  if (!appointmentId) return { errorKey: "generic" };

  const ctx = await requireOrg();
  if (!ctx) return { errorKey: "generic" };

  const ok = await cancelAppointment(ctx.org.id, appointmentId);
  if (!ok) return { errorKey: "generic" };

  revalidatePath("/panel/agenda");
  return null;
}

export type ConfirmAppointmentState = { errorKey: string } | null;

/** Accepts a patient's request; only now does it enter the consulta's day. */
export async function confirmAppointmentAction(
  _prevState: ConfirmAppointmentState,
  formData: FormData,
): Promise<ConfirmAppointmentState> {
  const appointmentId = (formData.get("appointmentId") as string) ?? "";
  if (!appointmentId) return { errorKey: "generic" };

  const ctx = await requireOrg();
  if (!ctx) return { errorKey: "generic" };

  const ok = await confirmAppointment(ctx.org.id, appointmentId);
  if (!ok) return { errorKey: "generic" };

  revalidatePath("/panel/agenda");
  return null;
}
