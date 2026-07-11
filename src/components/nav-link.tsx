"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Center nav item (design.md Navigation Menu): active is emphasized, inactive
// is muted with a hover surface.
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "rounded-full px-3 py-1.5 text-sm font-semibold text-ink"
          : "rounded-full px-3 py-1.5 text-sm text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink"
      }
    >
      {children}
    </Link>
  );
}
