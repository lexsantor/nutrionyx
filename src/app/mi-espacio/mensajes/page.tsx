import { getTranslations, getFormatter } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { findPatientByAuthUserId } from "@/modules/patient/repository";
import {
  listThread,
  markThreadRead,
} from "@/modules/messaging/repository";
import { Topbar } from "@/components/topbar";
import { MessageThread } from "@/components/message-thread";
import { PatientNav } from "../patient-nav";
import { Composer } from "./composer";

export const dynamic = "force-dynamic";

export default async function PatientMessagesPage() {
  const t = await getTranslations("messages");
  const format = await getFormatter();

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  const patient = await findPatientByAuthUserId(session.user.id);
  if (!patient) {
    redirect("/");
  }

  await markThreadRead(patient.organizationId, patient.id, "PATIENT");
  const thread = await listThread(patient.organizationId, patient.id);

  return (
    <>
      <Topbar nav={<PatientNav />} />
      <main id="contenido" className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{t("patientHeading")}</h1>
          <p className="text-sm text-ink-subtle">{t("patientHint")}</p>
        </div>

        <div className="flex w-full max-w-2xl flex-1 flex-col gap-6">
          <MessageThread
            messages={thread.map((m) => ({
              id: m.id,
              sender: m.sender,
              body: m.body,
              sentAt: format.dateTime(m.createdAt, {
                dateStyle: "medium",
                timeStyle: "short",
              }),
            }))}
            ownSide="PATIENT"
            emptyText={t("emptyPatient")}
            senderNames={{
              own: t("senders.you"),
              other: t("senders.consulta"),
            }}
          />
          <Composer />
        </div>
      </main>
    </>
  );
}
