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
import { Buildings } from "reicon-react/icons/Buildings";
import { ClipboardList } from "reicon-react/icons/ClipboardList";
import { Settings } from "reicon-react/icons/Settings";
import { BillList } from "reicon-react/icons/BillList";
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
type NavItemDef = {
  key: string;
  href: string;
  icon: IconType;
  /**
   * The section exists and is reachable, but nothing in it is switched on.
   * The entry stays dimmed and says so out loud, because a nav item that only
   * looks different tells a screen reader nothing.
   */
  soon?: boolean;
};

const CONSOLE_NAV: NavItemDef[] = [
  { key: "inicio", href: "/panel", icon: Home },
  { key: "pacientes", href: "/panel/pacientes", icon: Users },
  { key: "mensajes", href: "/panel/mensajes", icon: ChatRound },
  { key: "agenda", href: "/panel/agenda", icon: Calendar },
  { key: "biblioteca", href: "/panel/biblioteca", icon: Book },
  { key: "facturacion", href: "/panel/facturacion", icon: BillList, soon: true },
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
  { key: "billing", href: "/mi-espacio/facturacion", icon: BillList, soon: true },
];
const PATIENT_ACCOUNT: NavItemDef = {
  key: "profile",
  href: "/mi-espacio/perfil",
  icon: User,
};

const ADMIN_NAV: NavItemDef[] = [
  { key: "resumen", href: "/admin", icon: Home },
  { key: "consultas", href: "/admin/consultas", icon: Buildings },
  { key: "auditoria", href: "/admin/auditoria", icon: ClipboardList },
];
// The platform has one administrator and a handful of consultas, so the
// account slot carries the codes rather than a settings page nobody needs.
const ADMIN_ACCOUNT: NavItemDef = {
  key: "codigos",
  href: "/admin/codigos",
  icon: Book,
};

const ICON_SIZE = 18;

const navBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm no-underline transition-[background-color,color,box-shadow] duration-200 ease-house";
const navActive = `${navBase} bg-primary font-semibold text-on-primary shadow-el-sm`;
// Unread is not an error, but red is what a person reads as "something is
// waiting for you" in a sidebar, and the owner asked for it. The same pair
// the destructive button uses, so it inverts correctly in both themes.
//
// No margin here. The first version baked in `ml-auto` for the sidebar and
// the mobile pill added `ml-1.5` on top; two margin-left utilities of equal
// specificity settle by stylesheet order, not by the order of the class
// attribute (tasks/lessons.md), so `ml-auto` won and computed to zero outside
// a flex row - the badge ended up flush against the label. Each nav says
// where its own gap comes from.
const badgePill =
  "inline-flex min-w-5 items-center justify-center rounded-full bg-error px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-on-destructive";

const navIdle = `${navBase} text-ink-subtle hover:bg-surface-3 hover:text-ink`;

// Declared at module scope (react-hooks/static-components): a component nested
// in render would remount on every parent render.
function NavItem({
  href,
  label,
  icon: Icon,
  active,
  soon,
  soonLabel,
  badge,
  badgeLabel,
}: {
  href: string;
  label: string;
  icon: IconType;
  active: boolean;
  soon?: boolean;
  soonLabel: string;
  /** Unread count. Absent or zero renders nothing. */
  badge?: number;
  badgeLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${active ? navActive : navIdle} ${soon && !active ? "opacity-55" : ""}`}
    >
      <Icon size={ICON_SIZE} aria-hidden="true" />
      {label}
      {soon ? <span className="sr-only"> ({soonLabel})</span> : null}
      {badge ? (
        <>
          {/* The digit is decoration once the count is spelled out beside it,
              so only one of the two reaches a screen reader. Capped, because
              a four-digit pill would push the label out of its row. */}
          <span
            aria-hidden="true"
            className={`${badgePill} ml-auto ${active ? "ring-1 ring-on-primary/30" : ""}`}
          >
            {badge > 99 ? "99+" : badge}
          </span>
          <span className="sr-only">{badgeLabel}</span>
        </>
      ) : null}
    </Link>
  );
}

function Shell({
  primary,
  account,
  labelNamespace,
  root,
  badges,
  children,
}: {
  primary: NavItemDef[];
  account: NavItemDef;
  /** Unread counts by nav key. Threaded from the layout, which is a server
   *  component; this module is a client one because its icons are components. */
  badges?: Record<string, number>;
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
        soonLabel={t("soon")}
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
                  soon={item.soon}
                  soonLabel={t("soon")}
                  badge={badges?.[item.key]}
                  badgeLabel={t("unread", { count: badges?.[item.key] ?? 0 })}
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
                className={`${
                  active
                    ? "whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary no-underline shadow-el-sm transition-[background-color,color,box-shadow] duration-200 ease-house"
                    : "whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-ink-subtle no-underline transition-[background-color,color,box-shadow] duration-200 ease-house"
                } ${item.soon && !active ? "opacity-55" : ""}`}
              >
                {label(item.key)}
                {item.soon ? (
                  <span className="sr-only"> ({t("soon")})</span>
                ) : null}
                {badges?.[item.key] ? (
                  <>
                    <span aria-hidden="true" className={`${badgePill} ml-2`}>
                      {badges[item.key] > 99 ? "99+" : badges[item.key]}
                    </span>
                    <span className="sr-only">
                      {t("unread", { count: badges[item.key] })}
                    </span>
                  </>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <main
          id="contenido"
          className="flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function ConsoleShell({
  children,
  unreadMessages = 0,
}: {
  children: ReactNode;
  /** Unread patient messages across the whole consulta. */
  unreadMessages?: number;
}) {
  return (
    <Shell
      primary={CONSOLE_NAV}
      account={CONSOLE_ACCOUNT}
      labelNamespace="common.nav"
      root="/panel"
      badges={{ mensajes: unreadMessages }}
    >
      {children}
    </Shell>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <Shell
      primary={ADMIN_NAV}
      account={ADMIN_ACCOUNT}
      labelNamespace="admin.nav"
      root="/admin"
    >
      {children}
    </Shell>
  );
}

export function PatientShell({
  children,
  showMedication = false,
  unreadMessages = 0,
}: {
  children: ReactNode;
  /** Unread messages from this patient's consulta. */
  unreadMessages?: number;
  /**
   * Medication is opt-in (owner decision 2026-08-13): a patient who does not
   * follow one never sees the entry. The layout derives it from whether a
   * plan exists, so there is no second flag to keep in step with the first.
   */
  showMedication?: boolean;
}) {
  const primary = showMedication
    ? PATIENT_NAV
    : PATIENT_NAV.filter((item) => item.key !== "medication");
  return (
    <Shell
      primary={primary}
      account={PATIENT_ACCOUNT}
      labelNamespace="patientNav"
      root="/mi-espacio"
      badges={{ messages: unreadMessages }}
    >
      {children}
    </Shell>
  );
}
