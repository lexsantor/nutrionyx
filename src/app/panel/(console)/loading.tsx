import { getTranslations } from "next-intl/server";

// Console content skeleton: renders inside the persistent ConsoleShell
// layout, so only the content area pulses while the sidebar stays put.
export default async function ConsoleLoading() {
  const t = await getTranslations("common");
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-5">
      <span className="sr-only">{t("loading")}</span>
      <div className="h-8 w-56 animate-pulse rounded-full bg-surface-3" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="h-40 animate-pulse rounded-xl bg-surface-3 lg:col-span-7" />
        <div className="h-40 animate-pulse rounded-xl bg-surface-3 lg:col-span-5" />
        <div className="h-64 animate-pulse rounded-xl bg-surface-3 lg:col-span-12" />
      </div>
    </div>
  );
}
