"use client";

import type { ReactNode } from "react";

/**
 * Shared chrome for the printable documents (docs/build/slice-21-plan.md,
 * slice E). No PDF library: a dedicated route plus `@page` rules, and the
 * browser's own "Save as PDF". Adding @react-pdf/renderer or a headless
 * Chrome would be heavier than the problem and would give us a second
 * rendering engine to keep in sync with the screen.
 *
 * Lives outside /panel on purpose, so the console shell is not in the
 * document at all rather than hidden by a print rule.
 */
export function PrintFrame({
  consulta,
  logoUrl,
  patientName,
  title,
  subtitle,
  printLabel,
  backHref,
  backLabel,
  footer,
  children,
}: {
  consulta: string;
  logoUrl: string | null;
  patientName: string;
  title: string;
  subtitle: string | null;
  printLabel: string;
  backHref: string;
  backLabel: string;
  footer: string | null;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[820px] px-6 py-8 print:max-w-none print:px-0 print:py-0">
      {/* Screen-only controls: a printed page with a button on it is a
          page someone tries to press. */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <a
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-ink-subtle no-underline transition-colors hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          {backLabel}
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-[transform,background-color] hover:bg-primary-hover active:scale-[0.98] active:duration-150"
        >
          {printLabel}
        </button>
      </div>

      <article className="flex flex-col gap-6 rounded-xl border border-hairline bg-surface-1 p-8 print:gap-4 print:rounded-none print:border-0 print:bg-transparent print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight print:text-xl">
              {title}
            </h1>
            <p className="text-sm text-ink-subtle">{patientName}</p>
            {subtitle ? (
              <p className="text-sm text-ink-subtle">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoUrl}
                alt=""
                width={160}
                height={80}
                className="h-10 w-auto object-contain"
              />
            ) : null}
            <span className="text-sm font-semibold">{consulta}</span>
          </div>
        </header>

        {children}

        {footer ? (
          <footer className="border-t border-hairline pt-4 text-sm leading-relaxed text-ink-muted">
            {footer}
          </footer>
        ) : null}
      </article>
    </div>
  );
}
