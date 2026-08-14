import type { ReactNode } from "react";

/**
 * The marker for a section that exists but is not switched on.
 *
 * Two rules it enforces, both deliberate. It says so in words rather than
 * only in colour, because "everything is grey" is not information to someone
 * who cannot see the grey. And the section below it shows real structure with
 * empty states, never invented rows: a page that renders plausible-looking
 * invoices is a fabricated record, whatever the banner above it says.
 */
export function LockedNotice({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      role="note"
      className="flex flex-col gap-1.5 rounded-xl border border-hairline-strong bg-surface-3 px-4 py-3.5"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        {title}
      </p>
      <div className="text-sm leading-relaxed text-ink-muted">{children}</div>
    </div>
  );
}

/**
 * Wraps the inert half of such a section. `fieldset[disabled]` is the native
 * way to switch off every control inside at once, and assistive technology
 * reads it; dimming with opacity alone would only look switched off.
 */
export function LockedFieldset({
  legend,
  children,
}: {
  legend: string;
  children: ReactNode;
}) {
  return (
    <fieldset disabled className="flex flex-col gap-4 opacity-70">
      <legend className="sr-only">{legend}</legend>
      {children}
    </fieldset>
  );
}
