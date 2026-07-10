import type { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";

// App shell topbar (design.md 18.7): sticky, hairline underline, brand
// wordmark + right slot (page actions) + theme toggle.
export function Topbar({ right }: { right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          Nutrionyx
        </span>
        <div className="flex items-center gap-3">
          {right}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
