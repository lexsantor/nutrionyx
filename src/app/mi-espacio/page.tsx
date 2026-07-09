import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function PatientHomePage() {
  const t = await getTranslations("patientHome");
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">
        {t("welcome", { name: session.user.name })}
      </h1>
      <p className="max-w-md text-sm text-zinc-600">{t("assessmentPending")}</p>
    </main>
  );
}
