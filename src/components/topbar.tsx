import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ThemeToggle } from "./theme-toggle";
import { LogoutButton } from "@/app/logout-button";

// App shell topbar (design.md 18.7): brand left, centered nav, and on the
// right the theme switch + an outlined sign-out. `nav` is the center menu
// (omit it for areas without one, e.g. the patient space).
export async function Topbar({ nav }: { nav?: ReactNode }) {
  const t = await getTranslations("common");
  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-canvas">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-primary"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          Nutrionyx
        </span>
        {nav ? (
          <nav className="hidden items-center gap-1 sm:flex">{nav}</nav>
        ) : null}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
      {nav ? (
        <nav className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
          {nav}
        </nav>
      ) : null}
    </header>
  );
}
