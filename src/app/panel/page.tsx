import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const t = await getTranslations("panel");
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { data: organizations } = await auth.organization.list();

  if (!organizations || organizations.length === 0) {
    redirect("/panel/nueva-organizacion");
  }

  const active = organizations[0];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="flex items-baseline justify-between border-b border-zinc-200 pb-4">
        <h1 className="text-xl font-bold">{active.name}</h1>
        <span className="text-sm text-zinc-600">{session.user.name}</span>
      </header>

      <section className="py-8">
        <h2 className="text-lg font-semibold">{t("patients.title")}</h2>
        <p className="mt-2 text-sm text-zinc-600">{t("patients.empty")}</p>
      </section>
    </main>
  );
}
