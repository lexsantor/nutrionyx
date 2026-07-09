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

  // Wrong-account guard: the invitation is bound to the invited email.
  const { data: invitation } = await auth.organization.getInvitation({
    query: { id: invitationId },
  });
  const mismatch =
    invitation != null &&
    invitation.email.toLowerCase() !== session.user.email.toLowerCase();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-5 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

        {mismatch ? (
          <>
            <p role="alert" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {t("wrongAccount", {
                sessionEmail: session.user.email,
                invitedEmail: invitation.email,
              })}
            </p>
            <SignOutAndContinue invitationId={invitationId} />
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-600">{t("subtitle")}</p>
            <AcceptForm invitationId={invitationId} />
          </>
        )}
      </div>
    </main>
  );
}
