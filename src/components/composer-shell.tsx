"use client";

import { useEffect, useState, type ReactNode } from "react";
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
 * It also owns the stall notice. A patient on a phone hit send, the message
 * was stored, and the response never came back, so the button said "Enviando…"
 * over a message that had already arrived. Nothing here can recover a dropped
 * response, but a send that hangs must not look like a send that failed:
 * retyping it would post a second copy, and messaging never deletes.
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
  stalledLabel,
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
  /** Shown when a send has been in flight long enough to be in doubt. */
  stalledLabel: string;
  /** Sits under the field: what this channel is and is not. */
  hint?: string;
  /** Errors and status, rendered by the caller. */
  children?: ReactNode;
}) {
  // Long enough that a slow connection is not accused of stalling, short
  // enough to reach the person before they retype the message.
  const [stalled, setStalled] = useState(false);
  // Render-time adjustment, not an effect, matching the plan editors: a send
  // that finished is never in doubt, and clearing that inside the effect is a
  // synchronous setState the lint rule rightly refuses.
  const [wasPending, setWasPending] = useState(pending);
  if (pending !== wasPending) {
    setWasPending(pending);
    if (!pending) setStalled(false);
  }
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setStalled(true), 12_000);
    return () => clearTimeout(timer);
  }, [pending]);

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
      {stalled ? (
        <p
          role="status"
          className="rounded-[10px] bg-warning-soft px-3 py-2 text-sm text-warning"
        >
          {stalledLabel}
        </p>
      ) : null}
      {hint ? <p className="text-xs text-ink-subtle">{hint}</p> : null}
      {children}
    </div>
  );
}
