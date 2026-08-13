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

const FINE = "(pointer: fine)";

/**
 * True only where the primary pointer is a mouse or trackpad.
 *
 * The date field is enhanced behind this and the native one is left alone on
 * touch (slice-28, owner decision): iOS and Android give away a wheel picker
 * that is better than anything hand-rolled, and the patient space is used
 * mostly on a phone. Subscribing rather than reading once means a tablet that
 * gains or loses a mouse is handled for free.
 *
 * False during SSR, so it doubles as the mount gate.
 */
export function usePointerFine(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(FINE);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(FINE).matches,
    () => false,
  );
}
