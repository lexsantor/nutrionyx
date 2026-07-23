import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { resolveUserRole, roleHome } from "@/lib/auth/role";

export const dynamic = "force-dynamic";

export default async function Home() {
  const t = await getTranslations("home");
  const { data: session } = await auth.getSession();

  if (session?.user) {
    const role = await resolveUserRole(session.user.id);
    redirect(roleHome(role));
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute -inset-40 bg-[radial-gradient(ellipse_at_top,var(--color-primary-subtle)_0%,transparent_60%)]" />

        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-4 py-1.5 text-xs font-medium text-ink-subtle shadow-el-sm">
            <span className="size-1.5 rounded-full bg-success" />
            Plataforma para profesionales de la nutrición
          </div>

          <h1 className="text-balance font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t("hero.title")}{" "}
            <span className="text-primary">{t("hero.highlight")}</span>
          </h1>

          <p className="max-w-xl text-balance text-lg text-ink-subtle">
            {t("hero.description")}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/auth/sign-in"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-on-primary shadow-el-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-el-md active:scale-[0.97]"
            >
              {t("hero.cta.signIn")}
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-hairline bg-surface-1 px-7 text-sm font-semibold text-ink shadow-el-sm transition-all duration-200 hover:border-hairline-strong hover:bg-surface-2 hover:shadow-el-md active:scale-[0.97]"
            >
              {t("hero.cta.signUp")}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-24 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { key: "users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" },
            { key: "chart", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
            { key: "trending", icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" },
          ].map((feature) => (
            <div
              key={feature.key}
              className="group rounded-xl border border-hairline bg-surface-1 p-6 shadow-el-sm transition-all duration-200 hover:shadow-el-md"
            >
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary-subtle text-on-primary-subtle transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={feature.icon} />
                </svg>
              </div>
              <h3 className="mb-1 font-display text-base font-semibold">
                {t(`hero.features.${feature.key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-ink-subtle">
                {t(`hero.features.${feature.key}.text`)}
              </p>
            </div>
          ))}
        </div>

        <footer className="mt-24 pb-8 text-center text-xs text-ink-tertiary">
          &copy; {new Date().getFullYear()} Nutrionyx
        </footer>
      </div>
    </main>
  );
}
