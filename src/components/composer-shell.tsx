"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * The composer's chrome, shared by both sides of the thread.
 *
 * A card, not a flush dock. The thread above it is a record with no container
 * - a strip of time on the canvas - and the composer is the instrument you
 * pick up, so the contrast is the point. Complete on all four sides because a
 * short thread leaves it sitting mid-page with canvas below, where a missing
 * bottom edge reads as cut off; sticky so a long one keeps it reachable.
 *
 * `width="auto"` on the send button is the whole of the bug this replaces.
 * Button defaults to `w-full sm:w-auto` - right for a form whose action owns
 * its line on a phone - and this one sits beside a field, so under `sm` the
 * button took the row and the textarea collapsed to a single letter per line.
 * The primitive documents `auto` for exactly this case.
 */
export function ComposerShell({
  label,
  placeholder,
  name,
  defaultValue,
  maxLength,
  pending,
  sendLabel,
  sendingLabel,
  hint,
  children,
}: {
  label: string;
  placeholder: string;
  name: string;
  defaultValue: string;
  maxLength: number;
  pending: boolean;
  sendLabel: string;
  sendingLabel: string;
  /** Sits under the field: what this channel is and is not. */
  hint?: string;
  /** Errors and status, rendered by the caller. */
  children?: ReactNode;
}) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-col gap-2 rounded-xl border border-hairline bg-surface-1 px-4 py-4 shadow-el-md sm:px-5">
      <div className="flex items-end gap-2">
        <label htmlFor={name} className="sr-only">
          {label}
        </label>
        <textarea
          id={name}
          name={name}
          required
          maxLength={maxLength}
          rows={2}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="block min-h-11 w-full min-w-0 flex-1 resize-y rounded-[14px] border border-field-border bg-surface-2 px-3.5 py-2.5 text-base leading-relaxed text-ink placeholder:text-ink-subtle"
        />
        <Button type="submit" width="auto" disabled={pending}>
          {pending ? sendingLabel : sendLabel}
        </Button>
      </div>
      {hint ? <p className="text-xs text-ink-subtle">{hint}</p> : null}
      {children}
    </div>
  );
}
