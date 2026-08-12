import type { SelectHTMLAttributes } from "react";

/**
 * Themed select. The browser's own arrow is turned off (`appearance-none`)
 * and replaced with one drawn in our own ink, at our own inset, because the
 * native one sits at whatever padding each browser decides and reads as a
 * rendering fault next to fields that agree with each other.
 *
 * The *open* option list is not styled here and cannot be: a native
 * select's popup is drawn by the operating system, outside the page, so no
 * CSS reaches it. Replacing it means owning a listbox: keyboard, typeahead,
 * focus return, screen-reader semantics, and the mobile wheel that iOS and
 * Android give away for free. Until that trade is worth making, the closed
 * state is ours and the open one is the platform's.
 */
export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative w-full">
      <select
        className={`block h-11 w-full appearance-none rounded-[10px] border border-field-border bg-surface-2 py-0 pl-3.5 pr-10 text-base text-ink ${className}`}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
