import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole } from "@/lib/auth/role";

// Session-dependent server component: always render dynamically.
export const dynamic = "force-dynamic";

export default async function Home() {
  const t = await getTranslations("home");
  const { data: session } = await auth.getSession();

  if (session?.user) {
    const role = await resolveUserRole(session.user.id);
    redirect(role === "patient" ? "/mi-espacio" : "/panel");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Nutrionyx
      </h1>
      <p className="text-ink-subtle">{t("notSignedIn")}</p>
      <div className="flex gap-4">
        <Link href="/auth/sign-in" className="font-medium underline">
          {t("signIn")}
        </Link>
        <Link href="/auth/sign-up" className="font-medium underline">
          {t("signUp")}
        </Link>
      </div>
    </main>
  );
}
