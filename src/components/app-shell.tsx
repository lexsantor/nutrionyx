"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { IconComponent } from "reicon-react";
import { Home } from "reicon-react/icons/Home";
import { Users } from "reicon-react/icons/Users";
import { Calendar } from "reicon-react/icons/Calendar";
import { Book } from "reicon-react/icons/Book";
import { ChatRound } from "reicon-react/icons/ChatRound";
import { ChefHat } from "reicon-react/icons/ChefHat";
import { Dumbbell } from "reicon-react/icons/Dumbbell";
import { Pills } from "reicon-react/icons/Pills";
import { ChartLine } from "reicon-react/icons/ChartLine";
import { User } from "reicon-react/icons/User";
import { Settings } from "reicon-react/icons/Settings";
import { Logout } from "reicon-react/icons/Logout";
import { ThemeToggle } from "./theme-toggle";
import { signOut } from "@/lib/auth/sign-out";

// The platform shell (adapted from Pulse CRM, adr/0005; rethemed to NORTE).
// One chrome for both areas: a fixed sidebar with the primary nav, and a
// bottom slot for the account controls behind a separator. On mobile the
// sidebar collapses to a top header plus a scrolling row. The scroll area
// is <main> only, with a stable scrollbar gutter, so the centered content
// never shifts by the scrollbar width between routes.
//
// The patient space used its own Topbar until the shells were unified;
// two chromes for one product taught two mental models for no reason.
//
// Nav arrays live in this client module because their icons are
// components, which cannot cross the server boundary as props.

type IconType = IconComponent;
type NavItemDef = { key: string; href: string; icon: IconType };

const CONSOLE_NAV: NavItemDef[] = [
  { key: "inicio", href: "/panel", icon: Home },
  { key: "pacientes", href: "/panel/pacientes", icon: Users },
  { key: "mensajes", href: "/panel/mensajes", icon: ChatRound },
  { key: "agenda", href: "/panel/agenda", icon: Calendar },
  { key: "biblioteca", href: "/panel/biblioteca", icon: Book },
];
const CONSOLE_ACCOUNT: NavItemDef = {
  key: "ajustes",
  href: "/panel/ajustes",
  icon: Settings,
};

const PATIENT_NAV: NavItemDef[] = [
  { key: "home", href: "/mi-espacio", icon: Home },
  { key: "diet", href: "/mi-espacio/dieta", icon: ChefHat },
  { key: "training", href: "/mi-espacio/entreno", icon: Dumbbell },
  { key: "medication", href: "/mi-espacio/medicacion", icon: Pills },
  { key: "progress", href: "/mi-espacio/progreso", icon: ChartLine },
  { key: "messages", href: "/mi-espacio/mensajes", icon: ChatRound },
];
const PATIENT_ACCOUNT: NavItemDef = {
  key: "profile",
  href: "/mi-espacio/perfil",
  icon: User,
};

const ICON_SIZE = 18;

const navBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm no-underline transition-[background-color,color,box-shadow] duration-200 ease-house";
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

function Shell({
  primary,
  account,
  labelNamespace,
  root,
  children,
}: {
  primary: NavItemDef[];
  account: NavItemDef;
  /** Where the nav labels come from: "common.nav" or "patientNav". */
  labelNamespace: string;
  /** The area's index route, matched exactly so it does not stay lit. */
  root: string;
  children: ReactNode;
}) {
  const t = useTranslations("common");
  const label = useTranslations(labelNamespace);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === root ? pathname === root : pathname.startsWith(href);

  const bottomControls = (
    <>
      <NavItem
        href={account.href}
        label={label(account.key)}
        icon={account.icon}
        active={isActive(account.href)}
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
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-primary"
      >
        {t("skipToContent")}
      </a>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-surface-1 lg:flex">
        <div className="flex h-16 items-center px-6">
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Nutrionyx
          </span>
        </div>
        <nav className="flex-1 px-3 py-2">
          <ul className="flex flex-col gap-1">
            {primary.map((item) => (
              <li key={item.key}>
                <NavItem
                  href={item.href}
                  label={label(item.key)}
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
          {[...primary, account].map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary no-underline shadow-el-sm transition-[background-color,color,box-shadow] duration-200 ease-house"
                    : "whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-ink-subtle no-underline transition-[background-color,color,box-shadow] duration-200 ease-house"
                }
              >
                {label(item.key)}
              </Link>
            );
          })}
        </nav>

        <main id="contenido" className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function ConsoleShell({ children }: { children: ReactNode }) {
  return (
    <Shell
      primary={CONSOLE_NAV}
      account={CONSOLE_ACCOUNT}
      labelNamespace="common.nav"
      root="/panel"
    >
      {children}
    </Shell>
  );
}

export function PatientShell({ children }: { children: ReactNode }) {
  return (
    <Shell
      primary={PATIENT_NAV}
      account={PATIENT_ACCOUNT}
      labelNamespace="patientNav"
      root="/mi-espacio"
    >
      {children}
    </Shell>
  );
}
