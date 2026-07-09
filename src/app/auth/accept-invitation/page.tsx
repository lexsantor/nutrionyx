import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { AcceptForm } from "./accept-form";

export const dynamic = "force-dynamic";

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ invitationId?: string }>;
}) {
  const { invitationId } = await searchParams;
  const t = await getTranslations("acceptInvitation");

  if (!invitationId) {
    redirect("/");
  }

  const { data: session } = await auth.getSession();

  if (!session?.user) {
    const returnTo = encodeURIComponent(
      `/auth/accept-invitation?invitationId=${invitationId}`,
    );
    redirect(`/auth/sign-up?redirectTo=${returnTo}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-5 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-zinc-600">{t("subtitle")}</p>
        <AcceptForm invitationId={invitationId} />
      </div>
    </main>
  );
}
