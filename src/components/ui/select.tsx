"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type SelectHTMLAttributes,
} from "react";
import { useEnhanced } from "./enhance";


/**
 * Themed select. The closed state was always ours; the open list used to be
 * the operating system's, drawn outside the page where no CSS reaches.
 *
 * Now the real <select> stays in the DOM and a listbox is drawn over it
 * *after mount* (slice-28, decision D1a). Before hydration, and forever if the
 * bundle never lands, the native control is what the user gets: `required`,
 * `defaultValue`, form reset and autofill stay the browser's job, and three of
 * the five call sites submit without client JS. Backing this out is deleting
 * the enhancement, not a revert.
 *
 * The rows are read from the live <select> rather than from React children, so
 * it does not matter whether the <option>s were written by a server component
 * (`admin/auditoria`) or a client one, nor whether they sit in an <optgroup>.
 *
 * The popup is a top-layer popover anchored with CSS anchor positioning, which
 * was measured against this app's shell rather than assumed: it is not clipped
 * by the scroller and it wins against the sticky action bar. `position-area`
 * plus `flip-block` also handle a field near the bottom edge, which a
 * hand-positioned panel would have had to solve itself.
 */

type Row = {
  value: string;
  label: string;
  disabled: boolean;
  /** Label of the enclosing <optgroup>, or null. */
  group: string | null;
};

/**
 * Assigning `select.value` directly is invisible to React, so a controlled
 * call site would never hear the choice. Going through the prototype's setter
 * and dispatching a bubbling `change` makes a pick from the custom listbox
 * indistinguishable from a pick in the native popup, for controlled and
 * uncontrolled call sites alike.
 */
function commit(select: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value",
  )?.set;
  setter?.call(select, value);
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

function readRows(select: HTMLSelectElement): Row[] {
  return [...select.options].map((option) => ({
    value: option.value,
    label: option.textContent ?? "",
    disabled: option.disabled,
    group:
      option.parentElement instanceof HTMLOptGroupElement
        ? option.parentElement.label
        : null,
  }));
}

const FIELD =
  "block h-11 w-full min-w-0 appearance-none rounded-[10px] border border-field-border bg-surface-2 py-0 pl-3.5 pr-10 text-base text-ink";

export function Select({
  className = "",
  children,
  id,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const enhanced = useEnhanced();

  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [active, setActive] = useState(0);
  const [label, setLabel] = useState("");

  const reactId = useId();
  // A custom ident cannot carry the colons React puts in useId output.
  const anchor = `--sel-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const listId = `listbox-${anchor}`;

  // No dependency array on purpose: the selected option can change because the
  // parent re-rendered with a new `value`, not only because the user picked.
  // Re-subscribing every render is cheap next to tracking that by hand.
  useEffect(() => {
    const select = selectRef.current;
    if (!select) return;
    const sync = () => setLabel(select.selectedOptions[0]?.textContent ?? "");
    sync();
    select.addEventListener("change", sync);
    return () => select.removeEventListener("change", sync);
  });

  useEffect(() => {
    triggerRef.current?.style.setProperty("anchor-name", anchor);
  }, [anchor, enhanced]);

  const openList = useCallback((startAtSelected: boolean) => {
    const select = selectRef.current;
    if (!select) return;
    const next = readRows(select);
    setRows(next);
    setActive(startAtSelected ? Math.max(select.selectedIndex, 0) : 0);
    setOpen(true);
  }, []);

  // `popover="auto"` gives light dismiss and Esc for free, but it can also be
  // closed by the browser without going through our handler, so the element's
  // own toggle event is the source of truth for `open`.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (open && !list.matches(":popover-open")) list.showPopover();
    if (!open && list.matches(":popover-open")) list.hidePopover();
  }, [open]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const onToggle = (event: Event) => {
      const newState = (event as ToggleEvent).newState;
      if (newState === "closed") {
        setOpen(false);
        // The popover API only restores focus for popovertarget invocations,
        // and this one is opened from script.
        triggerRef.current?.focus();
      }
    };
    list.addEventListener("toggle", onToggle);
    return () => list.removeEventListener("toggle", onToggle);
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const choose = useCallback((index: number) => {
    const select = selectRef.current;
    const row = rows[index];
    if (!select || !row || row.disabled) return;
    commit(select, row.value);
    setOpen(false);
  }, [rows]);

  const typeahead = useRef({ buffer: "", at: 0 });
  const onType = useCallback(
    (key: string) => {
      const now = performance.now();
      const state = typeahead.current;
      state.buffer = now - state.at > 500 ? key : state.buffer + key;
      state.at = now;
      const from = rows.findIndex(
        (row, i) =>
          i > (state.buffer.length > 1 ? active - 1 : active) &&
          !row.disabled &&
          row.label.toLowerCase().startsWith(state.buffer.toLowerCase()),
      );
      const found =
        from >= 0
          ? from
          : rows.findIndex(
              (row) =>
                !row.disabled &&
                row.label.toLowerCase().startsWith(state.buffer.toLowerCase()),
            );
      if (found >= 0) setActive(found);
    },
    [rows, active],
  );

  const step = useCallback(
    (from: number, delta: number) => {
      let i = from;
      for (let guard = 0; guard < rows.length; guard++) {
        i += delta;
        if (i < 0 || i >= rows.length) return from;
        if (!rows[i].disabled) return i;
      }
      return from;
    },
    [rows],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList(true);
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => step(i, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => step(i, -1));
        break;
      case "Home":
        event.preventDefault();
        setActive(step(-1, 1));
        break;
      case "End":
        event.preventDefault();
        setActive(step(rows.length, -1));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        break;
      case "Tab":
        choose(active);
        break;
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          onType(event.key);
        }
    }
  };

  return (
    <div className="relative w-full">
      <select
        ref={selectRef}
        // The id moves to the trigger once enhanced, so the call site's own
        // <label htmlFor> ends up naming the control the user actually
        // operates. Every call site labels its field this way.
        id={enhanced ? undefined : id}
        // Kept in the layout rather than display:none, so a `required` select
        // is still focusable and the browser can put its validation bubble in
        // the right place. A hidden control would throw "not focusable".
        className={`${FIELD} ${enhanced ? "pointer-events-none opacity-0" : ""} ${className}`}
        aria-hidden={enhanced || undefined}
        tabIndex={enhanced ? -1 : undefined}
        {...props}
      >
        {children}
      </select>

      {enhanced ? (
        <>
          <button
            ref={triggerRef}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={open ? `${listId}-${active}` : undefined}
            id={id}
            aria-label={props["aria-label"]}
            aria-required={props.required || undefined}
            disabled={props.disabled}
            onClick={() => (open ? setOpen(false) : openList(true))}
            onKeyDown={onKeyDown}
            // The call site's height is stripped: it belongs to the native
            // select, which defines the box, and on an `inset-0` overlay a
            // `h-9` wins over `bottom: 0` and leaves the visible trigger
            // shorter than the field it covers. That is what made the audit
            // filters sit 8px above their own submit button.
            className={`absolute inset-0 flex items-center rounded-[10px] border border-field-border bg-surface-2 pl-3.5 pr-10 text-left text-base text-ink disabled:cursor-not-allowed disabled:opacity-60 ${className.replace(/\bh-[\w.[\]/-]+/g, "")}`}
          >
            <span className="truncate">{label}</span>
          </button>
          <div
            ref={listRef}
            id={listId}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ popover: "auto" } as any)}
            role="listbox"
            style={
              {
                positionAnchor: anchor,
                positionArea: "bottom span-right",
                positionTryFallbacks: "flip-block",
                width: "anchor-size(width)",
                // The fix for the band where neither side had room: with
                // `position-area` the containing block IS the free strip, so
                // 100% makes the list shrink and scroll instead of spilling
                // over its own field. `flip-block` still picks the roomier
                // side first; this only bounds the result.
                //
                // min() and not 100% alone: an inline max-block-size beats the
                // max-h-72 class, and the list would grow to fill whatever
                // room it found — 432px on a desktop viewport.
                maxBlockSize: "min(18rem, 100%)",
              } as React.CSSProperties
            }
            // my-2, not m-0: 8px of air off the field. A block margin rather
            // than an offset so the gap survives `flip-block`.
            className="mx-0 my-2 min-w-48 overflow-y-auto rounded-[10px] border border-hairline bg-surface-1 p-1 shadow-el-md"
          >
            {rows.map((row, index) => (
              <Fragment key={`${row.value}-${index}`}>
                {/* An <optgroup> becomes a heading over its run of options,
                    the way the native popup renders it, rather than a tag
                    repeated on every row. */}
                {row.group && row.group !== rows[index - 1]?.group ? (
                  <div
                    role="presentation"
                    className="px-3 pb-1 pt-2 text-xs font-semibold text-ink-subtle"
                  >
                    {row.group}
                  </div>
                ) : null}
                <div
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  aria-disabled={row.disabled || undefined}
                  data-active={index === active}
                  onMouseEnter={() => !row.disabled && setActive(index)}
                  onClick={() => choose(index)}
                  className={`cursor-pointer truncate rounded-lg px-3 py-2 text-sm text-ink ${
                    index === active ? "bg-surface-3" : ""
                  } ${row.disabled ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {row.label}
                </div>
              </Fragment>
            ))}
          </div>
        </>
      ) : null}

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
