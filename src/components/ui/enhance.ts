"use client";

import { useSyncExternalStore } from "react";

/** A store that never emits: the snapshots carry the whole answer. */
const NEVER = () => () => {};

/**
 * False on the server and on the first client render, true after mount.
 *
 * Every widget in slice-28 renders the plain native control until this turns
 * true, so hydration always matches what the server sent and the page keeps
 * working if the bundle never lands.
 *
 * `useSyncExternalStore` rather than a setState-in-effect flag: same result,
 * no cascading render, and this repo's eslint rejects the effect version
 * (react-hooks/set-state-in-effect).
 */
export function useEnhanced(): boolean {
  return useSyncExternalStore(
    NEVER,
    () => true,
    () => false,
  );
}

// A `usePointerFine` hook lived here to gate the calendar behind a mouse. A
// real iPhone showed the premise was wrong — iOS draws a calendar panel for
// type="date", not a wheel, and it overflows a 390px screen — so the gate went
// and the hook with it.

/**
 * A media query as a boolean, false during SSR.
 *
 * Used to decide how a popup is presented, not whether it exists: a panel
 * anchored to its field is right on a wide screen and impossible on a phone,
 * where a 354px calendar fits neither above nor below a field in the middle of
 * a 664px viewport and the browser ends up covering the field with it.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Tailwind's `sm`. Below it, popups are sheets rather than anchored panels. */
export const WIDE = "(min-width: 640px)";
