import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { AcceptForm } from "./accept-form";
import { SignOutAndContinue } from "./sign-out-and-continue";

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

  // getInvitation is recipient-only (Neon Auth Beta): a 403 means the
  // current session is not the invited account.
  const { data: invitation, error } = await auth.organization.getInvitation({
    query: { id: invitationId },
  });

  const wrongSession =
    !invitation && (error as { status?: number } | null)?.status === 403;

  if (wrongSession) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col gap-5 text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p role="alert" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {t("wrongSession", { sessionEmail: session.user.email })}
          </p>
          <SignOutAndContinue invitationId={invitationId} />
        </div>
      </main>
    );
  }

  // Consumed, cancelled, expired, or unreadable: dead end, say so.
  if (!invitation || invitation.status !== "pending") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col gap-5 text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p role="alert" className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
            {t("unavailable")}
          </p>
        </div>
      </main>
    );
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
