import type { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";
import { LogoutButton } from "@/app/logout-button";

// App shell topbar (design.md 18.7): brand left, centered nav, and on the
// right the theme switch + an outlined sign-out. `nav` is the center menu
// (omit it for areas without one, e.g. the patient space).
export function Topbar({ nav }: { nav?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
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
    </header>
  );
}
