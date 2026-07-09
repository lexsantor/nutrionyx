import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth/server";

// Session-dependent server component: always render dynamically.
export const dynamic = "force-dynamic";

export default async function Home() {
  const t = await getTranslations("home");
  const { data: session } = await auth.getSession();

  if (session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl">
          {t("signedInAs", { name: session.user.name })}
        </h1>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-mono text-2xl tracking-tight">Nutrionyx</h1>
      <p className="text-zinc-600">{t("notSignedIn")}</p>
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
