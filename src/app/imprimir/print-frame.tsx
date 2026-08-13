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
 *
 * The tints here are deliberately pale. A printed plan is something a
 * patient sticks on a fridge, and a designed sheet earns its ink through
 * structure (bands, cards, chips) rather than through saturation: solid
 * navy across seven pages is a cartridge, not a design.
 */
export function PrintFrame({
  consulta,
  logoUrl,
  kind,
  patientName,
  title,
  subtitle,
  printLabel,
  backHref,
  backLabel,
  notesLabel,
  footer,
  children,
}: {
  consulta: string;
  logoUrl: string | null;
  /** What this document is, printed opposite the mark. */
  kind: string;
  patientName: string;
  title: string;
  subtitle: string | null;
  printLabel: string;
  backHref: string;
  backLabel: string;
  notesLabel: string;
  footer: string | null;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[860px] px-6 py-8 print:max-w-none print:px-0 print:py-0">
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

      <article className="doc flex flex-col gap-5 rounded-xl border border-hairline bg-surface-1 p-8 print:gap-4 print:rounded-none print:border-0 print:bg-transparent print:p-0">
        {/* Masthead: the consulta's mark, and what the sheet is. Repeated
            on every printed page via position:fixed would fight the flow,
            so it leads the document once, like a letterhead. */}
        <header className="flex items-center justify-between gap-4 rounded-[10px] bg-primary-subtle px-5 py-3 print:rounded-none">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoUrl}
                alt=""
                width={240}
                height={120}
                className="h-9 w-auto max-w-40 object-contain"
              />
            ) : null}
            <span className="font-display text-base font-semibold tracking-tight text-on-primary-subtle">
              {consulta}
            </span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-primary-subtle">
            {kind}
          </span>
        </header>

        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b border-hairline pb-3">
          <div className="flex flex-col">
            <h1 className="font-display text-2xl font-semibold tracking-tight print:text-xl">
              {title}
            </h1>
            <p className="text-sm text-ink-muted">{patientName}</p>
          </div>
          {subtitle ? (
            <p className="text-xs text-ink-subtle">{subtitle}</p>
          ) : null}
        </div>

        {children}

        {footer ? (
          <aside className="break-inside-avoid rounded-[10px] border-l-[3px] border-primary bg-surface-2 px-4 py-3">
            <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              {notesLabel}
            </p>
            <p className="text-sm leading-relaxed text-ink-muted">{footer}</p>
          </aside>
        ) : null}
      </article>
    </div>
  );
}
