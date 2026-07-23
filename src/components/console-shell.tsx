"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { IconComponent } from "reicon-react";
import { Home } from "reicon-react/icons/Home";
import { Users } from "reicon-react/icons/Users";
import { Settings } from "reicon-react/icons/Settings";
import { Logout } from "reicon-react/icons/Logout";
import { ThemeToggle } from "./theme-toggle";
import { signOut } from "@/lib/auth/sign-out";

// Specialist console shell (adapted from Pulse CRM, adr/0005; rethemed to
// NORTE). Icons are Reicon (reicon-react). Primary nav sits at the top of a
// fixed sidebar; Ajustes, the theme switch and sign-out sit at the bottom
// behind a separator. On mobile the sidebar collapses to a top header.
// The scroll area is <main> only, with a stable scrollbar gutter, so the
// centered content never shifts by the scrollbar width between routes.

type IconType = IconComponent;

const PRIMARY_NAV: { key: string; href: string; icon: IconType }[] = [
  { key: "inicio", href: "/panel", icon: Home },
  { key: "pacientes", href: "/panel/pacientes", icon: Users },
];

const SETTINGS_NAV = { key: "ajustes", href: "/panel/ajustes", icon: Settings };

const ICON_SIZE = 18;

const navBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm no-underline transition-all duration-200";
const navActive = `${navBase} bg-primary font-semibold text-on-primary shadow-el-sm`;
const navIdle = `${navBase} text-ink-subtle hover:bg-surface-3 hover:text-ink`;

// Declared at module scope (react-hooks/static-components): a component nested
// in render would remount on every parent render.
function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: IconType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={active ? navActive : navIdle}
    >
      <Icon size={ICON_SIZE} aria-hidden="true" />
      {label}
    </Link>
  );
}

export function ConsoleShell({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);

  const bottomControls = (
    <>
      <NavItem
        href={SETTINGS_NAV.href}
        label={t(`nav.${SETTINGS_NAV.key}`)}
        icon={SETTINGS_NAV.icon}
        active={isActive(SETTINGS_NAV.href)}
      />
      <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink-subtle">
        <span>{t("theme")}</span>
        <ThemeToggle />
      </div>
      <form action={signOut}>
        <button type="submit" className={`${navIdle} w-full`}>
          <Logout size={ICON_SIZE} aria-hidden="true" />
          {t("signOut")}
        </button>
      </form>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-surface-1 lg:flex">
        <div className="flex h-16 items-center px-6">
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Nutrionyx
          </span>
        </div>
        <nav className="flex-1 px-3 py-2">
          <ul className="flex flex-col gap-1">
            {PRIMARY_NAV.map((item) => (
              <li key={item.key}>
                <NavItem
                  href={item.href}
                  label={t(`nav.${item.key}`)}
                  icon={item.icon}
                  active={isActive(item.href)}
                />
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-1 border-t border-hairline px-3 py-3">
          {bottomControls}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-hairline bg-surface-1 px-4 py-2 lg:hidden">
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Nutrionyx
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOut}>
              <button
                type="submit"
                aria-label={t("signOut")}
                className="inline-flex size-9 items-center justify-center rounded-lg text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink"
              >
                <Logout size={ICON_SIZE} aria-hidden="true" />
              </button>
            </form>
          </div>
        </header>

        <nav className="flex items-center gap-1 overflow-x-auto border-b border-hairline bg-surface-1 px-3 py-2 lg:hidden">
          {[...PRIMARY_NAV, SETTINGS_NAV].map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "whitespace-nowrap rounded-full bg-surface-3 px-3 py-1.5 text-sm font-semibold text-ink no-underline"
                    : "whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-ink-subtle no-underline"
                }
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          <div className="mx-auto w-full max-w-5xl px-8 py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
