import { getTranslations } from "next-intl/server";

// Patient-area skeleton: mirrors the bento home (topbar strip + tiles).
export default async function PatientLoading() {
  const t = await getTranslations("common");
  return (
    <main
      role="status"
      aria-busy="true"
      className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10"
    >
      <span className="sr-only">{t("loading")}</span>
      <div className="h-8 w-56 animate-pulse rounded-full bg-surface-3" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="h-48 animate-pulse rounded-xl bg-surface-3 lg:col-span-8" />
        <div className="h-48 animate-pulse rounded-xl bg-surface-3 lg:col-span-4" />
        <div className="h-72 animate-pulse rounded-xl bg-surface-3 lg:col-span-6" />
        <div className="h-72 animate-pulse rounded-xl bg-surface-3 lg:col-span-6" />
      </div>
    </main>
  );
}
