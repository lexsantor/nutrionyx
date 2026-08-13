"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";
import { WIDE, useEnhanced, useMediaQuery } from "./enhance";

/**
 * A date field whose calendar we own, at every width.
 *
 * It was gated behind `pointer: fine` at first, on the premise that iOS and
 * Android give away a wheel better than anything hand-rolled. Photographs from
 * a real iPhone killed that premise: `type="date"` on modern iOS is not a
 * wheel, it is a calendar panel that overflows the right edge of a 390px
 * screen and cannot be positioned from the page. Ours measures 304px at that
 * width with 37px to spare, and flips above the field when there is no room
 * below.
 *
 * (It also renders in the system's language rather than the page's, which is
 * correct behaviour for a native control and not a reason on its own.)
 *
 * The real <input type="date"> always stays in the DOM and remains the value:
 * `required`, `min`, `max`, form reset and submission are the browser's job.
 * The calendar writes into it through the prototype setter so a controlled
 * call site hears the change (tasks/lessons.md).
 *
 * Reached through the `Input` primitive rather than by editing call sites, so
 * `<Input type="date">` keeps working as it always did.
 */

const LOCALE = "es-ES";
const MONTH_YEAR = new Intl.DateTimeFormat(LOCALE, {
  month: "long",
  year: "numeric",
});
const FULL = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const DAY_NAME = new Intl.DateTimeFormat(LOCALE, { weekday: "short" });

/**
 * `new Date("2026-08-13")` is parsed as UTC and can land on the previous day
 * once rendered in a local calendar. Everything here goes through local
 * components instead, both ways.
 */
function fromISO(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toISO(date: Date): string {
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/** Monday-first offset for a JS day index, where 0 is Sunday. */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** The six-week grid that covers a month, Monday first. */
function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = addDays(first, -mondayIndex(first));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

function commit(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

const FIELD =
  "block h-11 w-full min-w-0 rounded-[10px] border border-field-border bg-surface-2 px-3.5 text-base text-ink placeholder:text-ink-subtle";

const WEEKDAYS = Array.from({ length: 7 }, (_, i) =>
  // 2024-01-01 was a Monday, so this walks Monday to Sunday.
  DAY_NAME.format(new Date(2024, 0, 1 + i)).slice(0, 2),
);

export function DateField({
  className = "",
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const enhanced = useEnhanced();
  // Anchored panel on a wide screen, sheet from the bottom edge on a phone.
  const wide = useMediaQuery(WIDE);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [month, setMonth] = useState<Date>(() => new Date());
  const [active, setActive] = useState<Date>(() => new Date());

  const reactId = useId();
  const anchor = `--date-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const popId = `calendar-${anchor}`;

  const min = typeof props.min === "string" ? fromISO(props.min) : null;
  const max = typeof props.max === "string" ? fromISO(props.max) : null;

  const outOfRange = useCallback(
    (date: Date) =>
      (min !== null && date < min) || (max !== null && date > max),
    [min, max],
  );

  // No dependency array: the value can also change because the parent
  // re-rendered, not only because the user picked. Same shape as Select.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const sync = () => setValue(input.value);
    sync();
    input.addEventListener("change", sync);
    return () => input.removeEventListener("change", sync);
  });

  useEffect(() => {
    triggerRef.current?.style.setProperty("anchor-name", anchor);
  }, [anchor, enhanced]);

  useEffect(() => {
    const pop = popRef.current;
    if (!pop) return;
    if (open && !pop.matches(":popover-open")) pop.showPopover();
    if (!open && pop.matches(":popover-open")) pop.hidePopover();
  }, [open]);

  useEffect(() => {
    const pop = popRef.current;
    if (!pop) return;
    const onToggle = (event: Event) => {
      if ((event as ToggleEvent).newState === "closed") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    pop.addEventListener("toggle", onToggle);
    return () => pop.removeEventListener("toggle", onToggle);
  }, []);

  // Focus follows the active day while the calendar is open, which is what
  // makes arrow keys announce anything at all.
  useEffect(() => {
    if (!open) return;
    popRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.focus();
  }, [open, active]);

  const openCalendar = () => {
    const current = fromISO(value) ?? new Date();
    setActive(current);
    setMonth(new Date(current.getFullYear(), current.getMonth(), 1));
    setOpen(true);
  };

  const choose = (date: Date) => {
    const input = inputRef.current;
    if (!input || outOfRange(date)) return;
    commit(input, toISO(date));
    setOpen(false);
  };

  const move = (next: Date) => {
    setActive(next);
    if (
      next.getMonth() !== month.getMonth() ||
      next.getFullYear() !== month.getFullYear()
    ) {
      setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const key = event.key;
    const jump: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (key in jump) {
      event.preventDefault();
      move(addDays(active, jump[key]));
      return;
    }
    switch (key) {
      case "Home":
        event.preventDefault();
        move(addDays(active, -mondayIndex(active)));
        break;
      case "End":
        event.preventDefault();
        move(addDays(active, 6 - mondayIndex(active)));
        break;
      case "PageUp":
        event.preventDefault();
        move(addDays(active, -28));
        break;
      case "PageDown":
        event.preventDefault();
        move(addDays(active, 28));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        break;
    }
  };

  const selected = fromISO(value);
  const today = new Date();
  const grid = monthGrid(month);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="date"
        // Same reason as Select: kept in the layout with opacity rather than
        // display:none, so a required field is still focusable and the
        // validation bubble lands over the trigger.
        id={enhanced ? undefined : id}
        className={`${FIELD} ${enhanced ? "pointer-events-none opacity-0" : ""} ${className}`}
        aria-hidden={enhanced || undefined}
        tabIndex={enhanced ? -1 : undefined}
        {...props}
      />

      {enhanced ? (
        <>
          <button
            ref={triggerRef}
            type="button"
            id={id}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={popId}
            disabled={props.disabled}
            onClick={() => (open ? setOpen(false) : openCalendar())}
            className={`absolute inset-0 flex items-center rounded-[10px] border border-field-border bg-surface-2 pl-3.5 pr-10 text-left text-base disabled:cursor-not-allowed disabled:opacity-60 ${
              selected ? "text-ink" : "text-ink-subtle"
            } ${className}`}
          >
            {selected ? FULL.format(selected) : "dd/mm/aaaa"}
          </button>

          <div
            ref={popRef}
            id={popId}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ popover: "auto" } as any)}
            role="dialog"
            aria-label={MONTH_YEAR.format(month)}
            style={
              wide
                ? ({
                    positionAnchor: anchor,
                    positionArea: "bottom span-right",
                    positionTryFallbacks: "flip-block",
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  } as any)
                : undefined
            }
            // Wide: anchored under the field, my-2 for 8px of air, and the
            // block margin means the gap survives `flip-block`.
            // Narrow: a sheet on the bottom edge. Measured on an iPhone 14,
            // an anchored 354px calendar fits neither above nor below a field
            // at 361px in a 664px viewport, and the browser resolves that by
            // covering the field. A sheet always fits.
            className={
              wide
                ? "mx-0 my-2 w-[19rem] max-w-[calc(100vw-2rem)] rounded-[10px] border border-hairline bg-surface-1 p-3 shadow-el-md"
                : "fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none rounded-b-none rounded-t-2xl border border-hairline bg-surface-1 p-4 pb-6 shadow-el-md"
            }
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setMonth(addMonths(month, -1))}
                aria-label="Mes anterior"
                className="flex size-8 items-center justify-center rounded-full text-ink-subtle hover:bg-surface-3 hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              {/* first-letter, not capitalize: Intl gives "agosto de 2026"
                  and `capitalize` would raise every word, including the
                  preposition. */}
              <span className="text-sm font-semibold text-ink first-letter:uppercase">
                {MONTH_YEAR.format(month)}
              </span>
              <button
                type="button"
                onClick={() => setMonth(addMonths(month, 1))}
                aria-label="Mes siguiente"
                className="flex size-8 items-center justify-center rounded-full text-ink-subtle hover:bg-surface-3 hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>

            {/* The grid handles the keys rather than each day, so arrows can
                cross a week or a month boundary without every cell repeating
                the same handler. */}
            <div role="grid" onKeyDown={onGridKeyDown}>
              <div role="row" className="grid grid-cols-7">
                {WEEKDAYS.map((day, i) => (
                  <span
                    key={i}
                    role="columnheader"
                    className="py-1 text-center text-xs font-medium capitalize text-ink-subtle"
                  >
                    {day}
                  </span>
                ))}
              </div>
              {[0, 1, 2, 3, 4, 5].map((week) => (
                <div role="row" key={week} className="grid grid-cols-7">
                  {grid.slice(week * 7, week * 7 + 7).map((date) => {
                    const isActive = toISO(date) === toISO(active);
                    const isSelected =
                      selected !== null && toISO(date) === toISO(selected);
                    const otherMonth = date.getMonth() !== month.getMonth();
                    const disabled = outOfRange(date);
                    return (
                      <button
                        key={toISO(date)}
                        type="button"
                        role="gridcell"
                        // Roving tabindex: one stop for the whole grid.
                        tabIndex={isActive ? 0 : -1}
                        data-active={isActive}
                        aria-selected={isSelected}
                        aria-current={
                          toISO(date) === toISO(today) ? "date" : undefined
                        }
                        disabled={disabled}
                        onClick={() => choose(date)}
                        className={`flex h-11 w-full items-center justify-center rounded-lg text-sm tabular-nums transition-colors ${
                          isSelected
                            ? "bg-primary font-semibold text-on-primary"
                            : otherMonth
                              ? "text-ink-subtle hover:bg-surface-3"
                              : "text-ink hover:bg-surface-3"
                        } ${
                          toISO(date) === toISO(today) && !isSelected
                            ? "font-semibold text-accent-text"
                            : ""
                        } disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle ${enhanced ? "" : "hidden"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    </div>
  );
}
