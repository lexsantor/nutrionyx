import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import {
  listThread,
  markThreadRead,
  unreadCount,
} from "@/modules/messaging/repository";
import { RefreshOnRead } from "@/components/refresh-on-read";
import { MessageThread } from "@/components/message-thread";
import { Composer } from "./composer";

export const metadata = { title: "Mis mensajes" };
export const dynamic = "force-dynamic";

export default async function PatientMessagesPage() {
  const t = await getTranslations("messages");

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    redirect("/");
  }

  // Counted before marking, so the refresh below fires once and only when
  // there was actually a badge to clear.
  const hadUnread = await unreadCount(
    patient.organizationId,
    patient.id,
    "PATIENT",
  );
  await markThreadRead(patient.organizationId, patient.id, "PATIENT");
  const thread = await listThread(patient.organizationId, patient.id);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{t("patientHeading")}</h1>
          <p className="text-sm text-ink-subtle">{t("patientHint")}</p>
        </div>

        <div className="flex w-full max-w-2xl flex-1 flex-col gap-8">
          <MessageThread
            messages={thread.map((m) => ({
              id: m.id,
              sender: m.sender,
              body: m.body,
              createdAt: m.createdAt,
            }))}
            ownSide="PATIENT"
            emptyText={t("emptyPatient")}
            senderNames={{
              own: t("senders.you"),
              other: t("senders.consulta"),
            }}
          />
          <Composer />
          <RefreshOnRead when={hadUnread > 0} />
        </div>
      </div>
    </>
  );
}
