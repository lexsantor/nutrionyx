"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./theme-toggle";
import { signOut } from "@/lib/auth/sign-out";

// Specialist console shell (adapted from Pulse CRM, adr/0005; rethemed to
// NORTE, no framer-motion / phosphor deps). Sidebar on lg+, a horizontal nav
// in the header on mobile.
const NAV = [
  { key: "inicio", href: "/panel", icon: HomeIcon },
  { key: "pacientes", href: "/panel/pacientes", icon: UsersIcon },
  { key: "ajustes", href: "/panel/ajustes", icon: GearIcon },
] as const;

export function ConsoleShell({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-surface-1 lg:flex">
        <div className="flex h-16 items-center px-6">
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Nutrionyx
          </span>
        </div>
        <nav className="flex-1 px-3 py-2">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "flex items-center gap-3 rounded-lg bg-surface-3 px-3 py-2 text-sm font-semibold text-ink"
                        : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink"
                    }
                  >
                    <Icon />
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-hairline bg-canvas px-4 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto lg:hidden">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={
                    active
                      ? "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-ink"
                      : "whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-ink-subtle"
                  }
                >
                  {t(`nav.${item.key}`)}
                </Link>
              );
            })}
          </nav>
          <span className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-full border border-hairline bg-surface-1 px-4 text-sm font-medium text-ink transition-colors hover:border-hairline-strong"
              >
                {t("signOut")}
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8M17 20a5.5 5.5 0 0 0-2.5-4.6" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}
