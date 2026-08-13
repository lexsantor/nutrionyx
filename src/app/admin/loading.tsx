import { getTranslations } from "next-intl/server";

// Platform-admin skeleton. A loading.tsx covers its whole segment, so this
// one serves resumen, consultas, auditoría and códigos: those are tables and
// stat rows, which is what the shapes below stand in for.
export default async function AdminLoading() {
  const t = await getTranslations("common");
  return (
    <main
      role="status"
      aria-busy="true"
      className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10"
    >
      <span className="sr-only">{t("loading")}</span>
      <div className="h-8 w-48 animate-pulse rounded-full bg-surface-3" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-3" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-surface-3" />
    </main>
  );
}
