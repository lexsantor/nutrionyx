import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireSpecialistOrg } from "@/lib/auth/specialist";
import { getPatientDetail } from "@/modules/patient/repository";
import {
  listThread,
  markThreadRead,
} from "@/modules/messaging/repository";
import { MessageThread } from "@/components/message-thread";
import { Composer } from "./composer";

export const metadata = { title: "Mensajes del paciente" };
export const dynamic = "force-dynamic";

export default async function SpecialistMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("messages");

  const { org } = await requireSpecialistOrg();

  const patient = await getPatientDetail(org.id, id);
  if (!patient) {
    notFound();
  }

  await markThreadRead(org.id, patient.id, "SPECIALIST");
  const thread = await listThread(org.id, patient.id);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href={`/panel/pacientes/${patient.id}`}
            className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-subtle no-underline transition-colors hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            {patient.fullName}
          </Link>
          <h1 className="text-2xl font-semibold">{t("panelHeading")}</h1>
        </div>

        <div className="flex max-w-2xl flex-col gap-8">
          <MessageThread
            messages={thread.map((m) => ({
              id: m.id,
              sender: m.sender,
              body: m.body,
              createdAt: m.createdAt,
            }))}
            ownSide="SPECIALIST"
            emptyText={t("emptyPanel")}
            senderNames={{
              own: t("senders.you"),
              other: t("senders.patient"),
            }}
          />
          <Composer patientId={patient.id} />
        </div>
      </div>
    </>
  );
}
